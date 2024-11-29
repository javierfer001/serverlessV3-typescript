import { DataSource } from 'typeorm'
import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { Driver } from 'src/App/dataSource'
import { Role, User } from 'src/Aggregate/User/Domain/User'
import { secret } from 'src/lib/aws/AwsSecret'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { handler as publicHandler } from 'src/aws-lambda/handler/public'
import { LoginCommand } from 'src/App/Mobile/LoginCommand'

describe('Test Login API', () => {
    let dataSource: DataSource, userRepo: UserRepo, manager: User

    beforeEach(async () => {
        jest.spyOn(Driver, 'destroy').mockReturnValue(Promise.resolve())

        dataSource = await Driver.connection()
        userRepo = new UserRepo(dataSource)
        await userRepo.delete({})

        manager = new User()
        manager.role = Role.manager
        manager.first = 'Brian'
        manager.last = 'Tulio'
        manager.phone = '+12345678901'
        manager.phoneVerify = true
        manager.email = 'manager@domain.company.com'
        await userRepo.save(manager)
    })

    afterEach(async () => {
        jest.restoreAllMocks()
        await Driver.dataSource.destroy()
    })

    it('Login', async () => {
        expect.assertions(1)

        jest.spyOn(secret, 'getValue').mockResolvedValue('secretValue')

        const verifyFn = jest.fn().mockResolvedValue({ email: manager.email })

        jest.spyOn(CognitoJwtVerifier, 'create').mockImplementation((): any => {
            return {
                verify: verifyFn,
            }
        })

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': process.env.PUBLIC_ACCESS_TOKEN,
                Authorization: 'Bearer cognito_bearer_token',
            },
            pathParameters: {
                source: LoginCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({}),
        }
        let result = await publicHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(JSON.parse(result.body)).toEqual(manager)
    })

    it('Login failed because does not exist in the db', async () => {
        expect.assertions(1)

        jest.spyOn(secret, 'getValue').mockResolvedValue('secretValue')

        const verifyFn = jest
            .fn()
            .mockResolvedValue({ email: manager.email + '_error' })

        jest.spyOn(CognitoJwtVerifier, 'create').mockImplementation((): any => {
            return {
                verify: verifyFn,
            }
        })

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': process.env.PUBLIC_ACCESS_TOKEN,
                Authorization: 'Bearer cognito_bearer_token',
            },
            pathParameters: {
                source: LoginCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({}),
        }
        let result = await publicHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(JSON.parse(result.body)).toEqual({
            error: 'User not register in our system',
        })
    })

    it('Login failed because the token expired', async () => {
        expect.assertions(1)

        jest.spyOn(secret, 'getValue').mockResolvedValue('secretValue')

        const verifyFn = jest.fn().mockRejectedValue(new Error('Token expired'))

        jest.spyOn(CognitoJwtVerifier, 'create').mockImplementation((): any => {
            return {
                verify: verifyFn,
            }
        })

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': process.env.PUBLIC_ACCESS_TOKEN,
                Authorization: 'Bearer cognito_bearer_token',
            },
            pathParameters: {
                source: LoginCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({}),
        }
        let result = await publicHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(JSON.parse(result.body)).toEqual({
            error: 'Token expired',
        })
    })
})
