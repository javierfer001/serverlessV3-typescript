import { Role, User } from 'src/Aggregate/User/Domain/User'
import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { DataSource } from 'typeorm'
import { AbstractCommand } from 'src/App/Base/AbstractCommand'

export class UserQuery extends AbstractCommand {
    static readonly NAME = 'users'
    static readonly METHOD = 'GET'

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

    async handler(): Promise<{ [key: string]: any }> {
        return this.userRepo.find({
            order: {
                first: 'ASC',
                last: 'ASC',
            },
        })
    }
}
