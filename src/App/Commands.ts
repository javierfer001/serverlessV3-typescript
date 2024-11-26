import {CreateUserCommand} from "src/App/User/CreateUserCommand";
import {UserQuery} from "src/App/User/UserQuery";

const commands = new Map<string, any>()

commands.set(CreateUserCommand.NAME, CreateUserCommand)
commands.set(UserQuery.NAME, UserQuery)

export const httpCommands = commands
