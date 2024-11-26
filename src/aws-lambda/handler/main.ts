import {Lambda} from "src/aws-lambda/middle/MiddleLambda";
import {HttpApiContext, LambdaAuthType} from "src/aws-lambda/middle/HttpApiContext";
import {HttpApiResponse} from "src/aws-lambda/middle/HttpApiResponse";
import {CommandHandler} from "src/App/Base/CommandHandler";
import {httpCommands} from "src/App/Commands";

const main = async (context: HttpApiContext) => {
    const source = <string>context.getParam('source')?.trim()
    let item = context.getParam('item')?.trim()

    let handle = new CommandHandler(
        context.dataSource,
        httpCommands,
        context.getUser(),
        context
    )

    return HttpApiResponse.result(await handle.handler(<string>source, context.body, item))
}
export const handler = Lambda.httpApi(main, LambdaAuthType.token)
