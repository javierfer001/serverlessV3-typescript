import { handler as cognitoHandler } from 'src/aws-lambda/handler/cognito-new-user'
import { DataSource } from 'typeorm'
import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { Driver } from 'src/App/dataSource'
import { Role, User } from 'src/Aggregate/User/Domain/User'

describe('Test SignUp API', () => {
    let dataSource: DataSource, userRepo: UserRepo

    beforeEach(async () => {
        jest.spyOn(Driver, 'destroy').mockReturnValue(Promise.resolve())

        dataSource = await Driver.connection()
        userRepo = new UserRepo(dataSource)
        await userRepo.delete({})
    })

    afterEach(async () => {
        jest.restoreAllMocks()
        await Driver.dataSource.destroy()
    })

    it('Sign up new client in cognito', async () => {
        expect.assertions(1)

        const userEmail = 'newUser@company.domain.com'
        const username = 'newUser1'
        let event: any = {
            userName: username,
            request: {
                userAttributes: {
                    email: userEmail,
                },
            },
        }
        let result = await cognitoHandler(event)
        expect(result).toEqual(event)
    })

    it('Sign up new partner manager in cognito', async () => {
        expect.assertions(1)

        const manager = new User()
        manager.role = Role.admin
        manager.first = 'John'
        manager.last = 'Smith'
        manager.phone = '+1234567867'
        manager.phoneVerify = true
        manager.email = 'manager@restaurant.domain.com'
        manager.setNewToken()
        await userRepo.save(manager)

        const username = 'newUser1'
        let event: any = {
            userName: username,
            request: {
                userAttributes: {
                    email: manager.email,
                },
            },
        }
        let result = await cognitoHandler(event)
        expect(result).toEqual({
            request: {
                userAttributes: {
                    email: manager.email,
                },
            },
            // Be sure the user is confirmed
            response: {
                autoConfirmUser: true,
                autoVerifyEmail: true,
            },
            userName: username,
        })
    })
})
