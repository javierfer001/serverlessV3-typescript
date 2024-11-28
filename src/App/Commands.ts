import { CreateUserCommand } from 'src/App/Dashboard/User/CreateUserCommand'
import { UserQuery } from 'src/App/Dashboard/User/UserQuery'
import { UpdateUserCommand } from 'src/App/Dashboard/User/UpdateUserCommand'

const commands = new Map<string, any>()

commands.set(CreateUserCommand.NAME, CreateUserCommand)
commands.set(UpdateUserCommand.NAME, UpdateUserCommand)
commands.set(UserQuery.NAME, UserQuery)

export const httpCommands = commands
