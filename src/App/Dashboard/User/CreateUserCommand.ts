import z from 'zod'
import { Role, User } from 'src/Aggregate/User/Domain/User'
import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { DataSource } from 'typeorm'
import { AbstractCommand } from 'src/App/Base/AbstractCommand'
import { EmailSchema, PhoneSchema } from 'src/types/base'

export const CreateUserSchema = z.object({
    first: z.string().optional(),
    last: z.string().optional(),
    email: EmailSchema,
    phone: PhoneSchema.optional(),
    role: z.enum([Role.manager, Role.admin]).optional(),
})

export class CreateUserCommand extends AbstractCommand {
    static readonly NAME = 'create-user'
    static readonly METHOD = 'POST'

    private readonly userRepo: UserRepo

    constructor(
        readonly driver: DataSource,
        readonly user: User
    ) {
        super(user)
        this.userRepo = new UserRepo(driver)
        if (this.user.role != Role.admin) {
            throw new Error(
                'Unauthorized access, your role is not allowed, Role: ' +
                    this.user.role
            )
        }
    }

    getFields(body: any) {
        return CreateUserSchema.parse(body)
    }

    async handler(data: Record<string, any>): Promise<{ [key: string]: any }> {
        const fields = this.getFields(data)
        let user = new User()
        user.email = fields.email
        if (fields?.first) {
            user.first = User.alphabeticChar(fields.first)
            user.last = User.alphabeticChar(fields.last)
        }

        if (fields?.role) {
            user.role = fields.role
        }

        /**
         * Change the phone number and send a verification code
         */
        if (fields?.phone) {
            await this.userRepo.setNewPhoneNumber(user, fields.phone)
        }

        await this.userRepo.save(user)
        return this.userRepo.findOneByOrFail({ id: user.id })
    }
}
