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

    public async handler(commandName: string, ...args: any[]): Promise<any> {
        const CommandClass = this.getHandlerClass(commandName)
        const command = new CommandClass(
            this.dataSource,
            this.loginUser,
            this.context
        )
        return command.handler(...args)
    }
}
