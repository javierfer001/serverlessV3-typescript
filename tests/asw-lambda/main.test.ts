import {handler as mainHandler} from "src/aws-lambda/handler/main";
import {CreateUserCommand} from "src/App/User/CreateUserCommand";
import {Role, User} from "src/Aggregate/User/Domain/User";
import {UserRepo} from "src/Aggregate/User/Infra/UserRepo";
import {Driver} from "src/App/dataSource";
import {DataSource} from "typeorm";

describe('Test CRUD API', () => {
    let admin: User,
        manager: User,
        dataSource: DataSource,
        userRepo: UserRepo

    beforeEach(async () => {
        jest.spyOn(Driver, 'destroy').mockReturnValue(Promise.resolve())

         dataSource = await Driver.connection()
        userRepo = new UserRepo(dataSource)

        admin = new User()
        admin.role = Role.admin
        admin.first = 'Javier'
        admin.last = 'Fdz'
        admin.phone = '+1234567890'
        admin.phoneVerify = true
        await userRepo.save(admin)

        manager = new User()
        manager.role = Role.manager
        manager.first = 'Brian'
        manager.last = 'Tulio'
        manager.phone = '+12345678901'
        manager.phoneVerify = true
        await userRepo.save(manager)
    })

    afterEach(async () => {
        jest.restoreAllMocks()
        await Driver.dataSource.destroy()
    })

    it('Request Create User', async () => {
        expect.assertions(4)
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'token': admin.token
            },
            pathParameters: {
                source: CreateUserCommand.NAME
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                role: Role.manager
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(200)
        expect(JSON.parse(result.body)).toEqual({
            "first": "John",
            "id": expect.any(String),
            "last": "Doe",
            "phone": null,
            "phoneCode": null,
            "phoneVerify": false,
            "role": Role.manager,
            "token": expect.stringContaining('token_'),
        })

        let users = await userRepo.find({
            where: {
                first: 'John',
                last: 'Doe'
            }
        })

        expect(users).toHaveLength(1)
        expect(users[0]).toEqual({
            "first": "John",
            "id": expect.any(String),
            "last": "Doe",
            "phone": null,
            "phoneCode": null,
            "phoneVerify": false,
            "role": Role.manager,
            "token": expect.stringContaining('token_'),
        })
    })

    it('Request wrong event', async () => {
        expect.assertions(2)
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'token': admin.token
            },
            pathParameters: {
                source: `${CreateUserCommand.NAME}_wrong`
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                role: Role.manager
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(JSON.parse(result.body)).toEqual({
            "error": "missing QueryEvent for event: create-user_wrong"
        })
    })

    it('Failed if user is not an admin', async () => {
        expect.assertions(3)
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'token': manager.token
            },
            pathParameters: {
                source: CreateUserCommand.NAME
            },
            body: JSON.stringify({
                first: 'John',
                last: 'Doe',
                phone: '+17866265478',
                role: Role.manager
            }),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(JSON.parse(result.body)).toEqual({
            "error": "Unauthorized access, your role is not allowed, Role: manager"
        })

        let users = await userRepo.find({
            where: {
                first: 'John',
                last: 'Doe'
            }
        })

        expect(users).toHaveLength(0)
    })
})
