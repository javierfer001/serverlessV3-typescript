import 'reflect-metadata'
import { Role } from 'src/Aggregate/User/Domain/User'
import { Driver } from 'src/App/dataSource'
import { SignUpUserCommand } from 'src/App/Mobile/SignUpUserCommand'
import get from 'lodash.get'

export const handler = async (event: any): Promise<boolean> => {
    let dataSource = await Driver.connection()
    const signUpUserHandler = new SignUpUserCommand(dataSource)
    let email = get(event, 'request.userAttributes.email', '@email')
    let user = await signUpUserHandler.handler({
        email,
        username: get(event, 'userName', email),
    })

    if (user && [Role.manager, Role.admin].includes(user.role)) {
        // Confirm the user
        event.response = event.response ?? {}
        event.response.autoConfirmUser = true
        // Set the email as verified if it is in the request
        if (event.request.userAttributes.hasOwnProperty('email')) {
            event.response.autoVerifyEmail = true
        }
    }

    return event
}
