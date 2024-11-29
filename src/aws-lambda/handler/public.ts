import { Lambda } from 'src/aws-lambda/middle/MiddleLambda'
import {
    HttpApiContext,
    LambdaAuthType,
} from 'src/aws-lambda/middle/HttpApiContext'
import { HttpApiResponse } from 'src/aws-lambda/middle/HttpApiResponse'
import { ApiVersionHandler } from 'src/App/ApiVersionHandler'
import { CommandHandler } from 'src/App/Base/CommandHandler'
import { LoginCommand } from 'src/App/Mobile/LoginCommand'

const publicHttpMap = new Map<string, any>()
publicHttpMap.set(ApiVersionHandler.NAME, ApiVersionHandler)
publicHttpMap.set(LoginCommand.NAME, LoginCommand)

const appVersionHandler = async (context: HttpApiContext) => {
    let handle = new CommandHandler(
        context.dataSource,
        publicHttpMap,
        null,
        context
    )

    return HttpApiResponse.result(await handle.handler())
}
export const handler = Lambda.httpApi(appVersionHandler, LambdaAuthType.public)
