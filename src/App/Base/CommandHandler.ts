import {DataSource} from "typeorm";
import {HttpApiContext} from "src/aws-lambda/middle/HttpApiContext";
import {User} from "src/Aggregate/User/Domain/User";

export class CommandHandler {
    constructor(
        readonly dataSource: DataSource,
        readonly map: Map<string, any>,
        readonly loginUser: User | null,
        readonly context: HttpApiContext
    ) {
    }

    getHandlerClass(commandName: string): any {
        let command = this.map.get(commandName)
        if (this.isCommandClass(command)) return command

        throw new Error(
            `missing QueryEvent for event: ${commandName}`,
        )
    }

    private isCommandClass(c: any): boolean {
        return (
            typeof c == 'function' &&
            'handler' in c.prototype &&
            typeof c.prototype.handler == 'function'
        )
    }

    public async handler(): Promise<any> {
        const commandName = <string>this.context.getParam('source')?.trim()

        const CommandClass = this.getHandlerClass(commandName)
        const command = new CommandClass(
            this.dataSource,
            this.loginUser,
            this.context
        )
        this.context.isMethod(CommandClass.METHOD)

        let id = this.context.getParam('item')?.trim()

        if (CommandClass.METHOD == 'PUT' && !id) {
            throw new Error(
                'The item id is required for this method',
            )
        }

        return command.handler(this.context.body, id)
    }
}
