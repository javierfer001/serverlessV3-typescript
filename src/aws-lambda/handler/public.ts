import {Lambda} from "src/aws-lambda/middle/MiddleLambda";
import {HttpApiContext, LambdaAuthType} from "src/aws-lambda/middle/HttpApiContext";
import {HttpApiResponse} from "src/aws-lambda/middle/HttpApiResponse";
import {AppVersion} from "src/App/appVersion";

const appVersionHandler = async (_: HttpApiContext) => {
    return HttpApiResponse.result(AppVersion.version())
}
export const handler = Lambda.httpApi(appVersionHandler, LambdaAuthType.public)
