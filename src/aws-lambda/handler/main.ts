import {Lambda} from "src/aws-lambda/middle/MiddleLambda";
import {HttpApiContext, LambdaAuthType} from "src/aws-lambda/middle/HttpApiContext";
import {logger} from "src/lib/logger";
import {HttpApiResponse} from "src/aws-lambda/middle/HttpApiResponse";
import {Hello} from "src/App/hello";

const main = async (context: HttpApiContext) => {
    logger.log('Hello World!')
    return HttpApiResponse.result(Hello.sayHello())
}
export const handler = Lambda.httpApi(main, LambdaAuthType.public)
