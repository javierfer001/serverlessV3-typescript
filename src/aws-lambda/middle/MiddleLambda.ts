import 'reflect-metadata'
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda'

import { HttpApiResponse } from './HttpApiResponse'
import {HttpApiContext, LambdaAuthType} from "src/aws-lambda/middle/HttpApiContext";
import {logger} from "src/lib/logger";


export type HttpApiHandler = (
    context: HttpApiContext
) => Promise<APIGatewayProxyResult>

export class MiddleLambda {
    private static _instance: MiddleLambda
    public lambdaName = ''

    public static getInstance() {
        if (!MiddleLambda._instance) {
            MiddleLambda._instance = new MiddleLambda()
        }
        return MiddleLambda._instance
    }


    public httpApi(handler: HttpApiHandler, authz: LambdaAuthType) {
        return async (
            event: APIGatewayProxyEventV2,
            context: Context
        ): Promise<APIGatewayProxyResult> => {
            let httpApiContext: HttpApiContext | undefined
            try {
                context.callbackWaitsForEmptyEventLoop = true
                this.lambdaName = handler.name
                httpApiContext = new HttpApiContext(
                    event,
                    context,
                    this.lambdaName,
                    authz
                )
                await httpApiContext.create()
                return await handler(httpApiContext)
            } catch (error) {
                logger.error(`Error Lambda: ${this.lambdaName}`, {
                    error: error.message,
                })
                return HttpApiResponse.error(error)
            } finally {
                await httpApiContext?.close()
            }
        }
    }
}
export const Lambda = MiddleLambda.getInstance()
