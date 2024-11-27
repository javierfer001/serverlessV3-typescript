import { User } from 'src/Aggregate/User/Domain/User'

export abstract class AbstractCommand {
    protected constructor(readonly user: User | null) {}

    public abstract handler(
        fields: { [key: string]: unknown },
        id?: string
    ): Promise<any>
}
