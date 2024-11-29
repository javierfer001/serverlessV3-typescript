import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { DataSource } from 'typeorm'
import { AbstractCommand } from 'src/App/Base/AbstractCommand'
import { Role, User } from 'src/Aggregate/User/Domain/User'

/**
 * Cognito sign up user.
 */
export class SignUpUserCommand extends AbstractCommand {
    static readonly NAME = 'cognito-sign-up'
    // This is a cognito command, called by the cognito service.
    static readonly METHOD = 'NONE'

    readonly userRepo: UserRepo

    constructor(private dataSource: DataSource) {
        super(null)
        this.userRepo = new UserRepo(this.dataSource)
    }

    async handler({
        email,
        username,
    }: {
        email: string
        username: string
    }): Promise<User> {
        let user = await this.userRepo.findOneBy({
            email,
        })
        if (user) {
            if (user.username != username) {
                user.username = username
                await this.userRepo.save(user)
            }
            return user
        }
        user = new User()
        user.username = username
        user.email = email
        user.role = Role.client
        user.setNewToken()

        await this.userRepo.save(user)

        return user
    }
}
