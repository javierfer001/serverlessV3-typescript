import { handler as mainHandler } from 'src/aws-lambda/handler/main'
import { CreateUserCommand } from 'src/App/Dashboard/User/CreateUserCommand'
import { Role, User } from 'src/Aggregate/User/Domain/User'
import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { Driver } from 'src/App/dataSource'
import { DataSource } from 'typeorm'
import { UserQuery } from 'src/App/Dashboard/User/UserQuery'
import { UpdateUserCommand } from 'src/App/Dashboard/User/UpdateUserCommand'
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint'
import { mockClient } from 'aws-sdk-client-mock'

const smsMock = mockClient(PinpointClient as any)

describe('Test Create, Update and List API', () => {
    let admin: User, manager: User, dataSource: DataSource, userRepo: UserRepo

    beforeEach(async () => {
        jest.spyOn(Driver, 'destroy').mockReturnValue(Promise.resolve())

        dataSource = await Driver.connection()
        userRepo = new UserRepo(dataSource)
        await userRepo.delete({})

        admin = new User()
        admin.role = Role.admin
        admin.first = 'Javier'
        admin.last = 'Fdz'
        admin.phone = '+1234567890'
        admin.phoneVerify = true
        admin.email = 'admin@domain.company.com'
        await userRepo.save(admin)

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

    it('Request create user', async () => {
        expect.assertions(6)
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                token: admin.token,
            },
            pathParameters: {
                source: CreateUserCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                role: Role.manager,
                email: 'manager1@domain.company.com',
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(200)
        expect(JSON.parse(result.body)).toEqual({
            first: 'John',
            id: expect.any(String),
            last: 'Doe',
            phone: '+17866265478',
            phoneCode: expect.any(String),
            phoneVerify: false,
            email: 'manager1@domain.company.com',
            username: null,
            role: Role.manager,
            token: expect.stringContaining('token_'),
        })

        let users = await userRepo.find({
            where: {
                first: 'John',
                last: 'Doe',
            },
        })

        expect(users).toHaveLength(1)
        expect(users[0]).toEqual({
            first: 'John',
            id: expect.any(String),
            last: 'Doe',
            phone: '+17866265478',
            phoneCode: expect.any(String),
            phoneVerify: false,
            role: Role.manager,
            email: 'manager1@domain.company.com',
            username: null,
            token: expect.stringContaining('token_'),
        })

        event = {
            headers: {
                'Content-Type': 'application/json',
                token: admin.token,
            },
            requestContext: {
                http: {
                    method: 'GET',
                },
            },
            pathParameters: {
                source: UserQuery.NAME,
            },
            body: JSON.stringify({}),
        }
        result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(200)
        expect(JSON.parse(result.body)).toEqual([
            {
                first: 'Brian',
                id: manager.id,
                last: 'Tulio',
                phone: '+12345678901',
                phoneCode: null,
                phoneVerify: true,
                role: Role.manager,
                token: manager.token,
                email: 'manager@domain.company.com',
                username: null,
            },
            {
                first: 'Javier',
                id: admin.id,
                last: 'Fdz',
                phone: '+1234567890',
                phoneCode: null,
                phoneVerify: true,
                role: Role.admin,
                token: admin.token,
                email: 'admin@domain.company.com',
                username: null,
            },
            {
                first: 'John',
                id: users[0].id,
                last: 'Doe',
                phone: '+17866265478',
                phoneCode: expect.any(String),
                phoneVerify: false,
                role: Role.manager,
                token: users[0].token,
                email: 'manager1@domain.company.com',
                username: null,
            },
        ])
    })

    it('Verify user phone number', async () => {
        expect.assertions(5)
        smsMock.on(SendMessagesCommand as any).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '8ee7eb84-4c9f-49a5-9f86-843708cecd0b',
                cfId: '26TKsQI6y8Fio6seaIUdO6vIqRgD_cWZzokD3VsUiUPd9F-tkUGLXg==',
                attempts: 1,
                totalRetryDelay: 0,
            },
            MessageResponse: {
                ApplicationId: '498bfa419b164b9fafc0afb38f7018e7',
                RequestId: 'M6yNeEFlPHcF5dg=',
                Result: {
                    '+17866262322': {
                        DeliveryStatus: 'SUCCESSFUL',
                        StatusCode: 200,
                        StatusMessage:
                            'MessageId: 25hhgl74lcob7nc2s5ie6bcqgqdhn4hkrae0d6o0',
                        MessageId: '25hhgl74lcob7nc2s5ie6bcqgqdhn4hkrae0d6o0',
                    },
                },
            },
        } as any)

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                token: admin.token,
            },
            pathParameters: {
                source: CreateUserCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                role: Role.manager,
                email: 'manager1@domain.company.com',
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(200)
        let newUser = JSON.parse(result.body)
        expect(JSON.parse(result.body)).toEqual({
            first: 'John',
            id: expect.any(String),
            last: 'Doe',
            phone: '+17866265478',
            phoneCode: expect.any(String),
            phoneVerify: false,
            role: Role.manager,
            email: 'manager1@domain.company.com',
            username: null,
            token: expect.stringContaining('token_'),
        })

        let user = await userRepo.findOneByOrFail({
            id: newUser.id,
        })
        expect(user).toEqual({
            first: 'John',
            id: expect.any(String),
            last: 'Doe',
            phone: '+17866265478',
            phoneCode: expect.any(String),
            phoneVerify: false,
            role: Role.manager,
            email: 'manager1@domain.company.com',
            username: null,
            token: expect.stringContaining('token_'),
        })

        event = {
            headers: {
                'Content-Type': 'application/json',
                token: admin.token,
            },
            requestContext: {
                http: {
                    method: 'PUT',
                },
            },
            pathParameters: {
                source: UpdateUserCommand.NAME,
                item: user.id,
            },
            body: JSON.stringify({
                phoneCode: user.phoneCode,
            }),
        }
        result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(200)
        expect(JSON.parse(result.body)).toEqual({
            first: 'John',
            id: expect.any(String),
            last: 'Doe',
            phone: '+17866265478',
            phoneCode: '',
            phoneVerify: true,
            role: Role.manager,
            email: 'manager1@domain.company.com',
            username: null,
            token: expect.stringContaining('token_'),
        })
    })

    it('Failed wrong phone number', async () => {
        expect.assertions(2)

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                token: admin.token,
            },
            pathParameters: {
                source: CreateUserCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '7866265478',
                role: Role.manager,
                email: 'manager1@domain.company.com',
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        let failedUser = JSON.parse(result.body)
        expect(failedUser).toEqual({
            error: [
                {
                    code: 'invalid_string',
                    message:
                        'It is not a valid phone number, format +1XXXXXXXXXX',
                    path: ['phone'],
                    validation: 'regex',
                },
            ],
        })
    })

    it('Failed wrong email format', async () => {
        expect.assertions(2)

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                token: admin.token,
            },
            pathParameters: {
                source: CreateUserCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                role: Role.manager,
                email: 'manager1 @domain.company.com_wrong',
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        let failedUser = JSON.parse(result.body)
        expect(failedUser).toEqual({
            error: [
                {
                    code: 'invalid_string',
                    message: 'invalid email address',
                    path: ['email'],
                    validation: 'regex',
                },
            ],
        })
    })

    it('Request wrong event', async () => {
        expect.assertions(2)
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                token: admin.token,
            },
            pathParameters: {
                source: `${CreateUserCommand.NAME}_wrong`,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                email: 'manager1@domain.company.com',
                role: Role.manager,
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(JSON.parse(result.body)).toEqual({
            error: 'missing QueryEvent for event: create-user_wrong',
        })
    })

    it('Failed if user is not an admin', async () => {
        expect.assertions(3)
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                token: manager.token,
            },
            pathParameters: {
                source: CreateUserCommand.NAME,
            },
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                role: Role.manager,
                email: 'manager1@domain.company.com',
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(JSON.parse(result.body)).toEqual({
            error: 'Unauthorized access, your role is not allowed, Role: manager',
        })

        let users = await userRepo.find({
            where: {
                first: 'John',
                last: 'Doe',
            },
        })

        expect(users).toHaveLength(0)
    })
})
