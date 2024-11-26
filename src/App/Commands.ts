import {CreateUserCommand} from "src/App/User/CreateUserCommand";

const commands = new Map<string, any>()

commands.set(CreateUserCommand.NAME, CreateUserCommand)

export const httpCommands = commands
