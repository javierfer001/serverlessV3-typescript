import {CreateUserCommand} from "src/App/User/CreateUserCommand";
import {UserQuery} from "src/App/User/UserQuery";
import {UpdateUserCommand} from "src/App/User/UpdateUserCommand";

const commands = new Map<string, any>()

commands.set(CreateUserCommand.NAME, CreateUserCommand)
commands.set(UpdateUserCommand.NAME, UpdateUserCommand)
commands.set(UserQuery.NAME, UserQuery)

export const httpCommands = commands
