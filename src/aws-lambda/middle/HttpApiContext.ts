import 'reflect-metadata'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import z from 'zod'
import {LambdaConfig} from "src/aws-lambda/LambdaConfig";

export enum LambdaAuthType {
    public,
    token,
}


const ValidateUserToken = z
    .string()
    .refine((x) => x.split('_')[0] == 'token', 'The token is invalid')

export class HttpApiContext {
    public readonly headers: Headers = new Headers()
    public readonly body: any | null
    public readonly filter: { [key: string]: any } = {}
    public readonly routeKey: string

    constructor(
        public readonly event: APIGatewayProxyEventV2,
        public readonly context: Context,
        public readonly lambdaName: string,
        public readonly authz: LambdaAuthType
    ) {
        for (let name in this.event.headers) {
            let value = this.event.headers[name]
            if (typeof value == 'string') {
                this.headers.set(name, value)
            }
        }

        let body = this.event.body,
            filter = this.event.queryStringParameters?.filter ?? false

        if (body) {
            if (event.isBase64Encoded)
                body = Buffer.from(body, 'base64').toString()
            body = JSON.parse(body)
            this.body = body
        }

        if (filter) {
            try {
                this.filter = JSON.parse(filter)
            } catch {
                throw new Error(
                    `filter param does not have JSON format, fn ${lambdaName}`,
                )
            }
        }

        this.routeKey = event.routeKey
    }

    public getParam(name: string): string | null {
        if (!this.event.pathParameters) return null
        return this.event.pathParameters[name] ?? null
    }

    async create(): Promise<HttpApiContext> {
        if (this.authz == LambdaAuthType.public) {
            const stringToken = this.headers.get('public-token')
            if (!stringToken) {
                throw new Error(
                    'Public token is missing in the request header',
                )
            }
            if (stringToken !== LambdaConfig.publicToken) {
                throw new Error(
                    'Public token is wrong, please contact the administrator',
                )
            }
        }

        else if (this.authz == LambdaAuthType.token) {
            const token = this.headers.get('token')
            if (!token) {
                throw new Error(
                    'Token is missing in the request header',
                )
            }
            ValidateUserToken.parse(token)
        } else {
            throw new Error(
                'Invalid auth type',
            )
        }
        return this
    }

    async close(): Promise<void> {
        // Close the connection or do any cleanup
    }
}
