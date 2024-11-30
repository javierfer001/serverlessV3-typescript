import z from 'zod'
import { Role, User } from 'src/Aggregate/User/Domain/User'
import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { DataSource } from 'typeorm'
import { AbstractCommand } from 'src/App/Base/AbstractCommand'
import { EmailSchema, PhoneSchema } from 'src/types/base'

export const CreateUserSchema = z.object({
    first: z.string().optional(),
    last: z.string().optional(),
    email: EmailSchema.optional(),
    phone: PhoneSchema.optional(),
    phoneCode: z.string().optional(),
    resentPhoneCode: z.boolean().optional(),
    role: z.enum([Role.manager, Role.admin]).optional(),
})

export class UpdateUserCommand extends AbstractCommand {
    static readonly NAME = 'update-user'
    static readonly METHOD = 'PUT'

    private readonly userRepo: UserRepo

    constructor(
        readonly driver: DataSource,
        readonly user: User
    ) {
        super(user)
        this.userRepo = new UserRepo(driver)
    }

    getFields(body: any) {
        return CreateUserSchema.parse(body)
    }

    async handler(
        data: Record<string, any>,
        id: string
    ): Promise<{ [key: string]: any }> {
        const fields = this.getFields(data)
        let user = await this.userRepo.findOneByOrFail({ id })

        if (fields?.first) {
            user.first = User.alphabeticChar(fields.first)
            user.last = User.alphabeticChar(fields.last)
        }

        if (fields?.role) {
            user.role = fields.role
        }
        if (fields?.email) {
            user.email = fields.email
        }

        /**
         * Change the phone number and send a verification code
         */
        if (fields?.phone) {
            await this.userRepo.setNewPhoneNumber(user, fields.phone)
        } else {
            /**
             * Resent the verification code
             */
            if (fields?.resentPhoneCode) {
                await this.userRepo.resendVerificationCode(this.user)
            }

            if (fields?.phoneCode) {
                if (user.phoneVerify) {
                    throw new Error('The phone number was verify')
                }
                user.verifyPhoneCode(fields.phoneCode)
            }
        }

        await this.userRepo.save(user)
        return this.userRepo.findOneByOrFail({ id: user.id })
    }
}
