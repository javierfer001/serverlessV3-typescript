import { APIGatewayProxyResult } from 'aws-lambda'
import {StatusCodes} from "src/aws-lambda/middle/HttpStatus";

const DEFAULT_HEADERS = {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-credentials': 'true',
}

export interface HeaderSet {
    [name: string]: string | undefined
}

export class HttpApiResponse {
    private readonly body: string
    private readonly headers: Headers = new Headers(DEFAULT_HEADERS)

    /**
     * @param {any} body when not a string, this will be passed to JSON.stringify. Otherwise, the response
     * body is set to this value.
     * @param statusCode
     * @param headers
     */
    public constructor(
        body: any,
        public readonly statusCode: StatusCodes,
        headers: Headers | HeaderSet | {} = {}
    ) {
        if (headers instanceof Headers) headers = this.headersToObject(headers)

        for (let n in headers) this.headers.set(n, headers[n] ?? '')

        body ??= ''
        if (body) {
            let type = typeof body

            if (type == 'symbol' || type == 'function')
                throw new Error(
                    `invalid response body type, found ${type}`,
                )

            if (type != 'string') body = JSON.stringify(body)
        }

        this.body = body
    }

    /**
     * @param {any} body when not a string, this will be passed to JSON.stringify. Otherwise, the response
     * body is set to this value.
     * @param statusCode
     * @param headers
     * @param isBase64Encoded
     */
    public static result(
        body: any = '',
        statusCode: StatusCodes = StatusCodes.OK,
        headers: Headers | HeaderSet | {} = {},
        isBase64Encoded = false
    ): APIGatewayProxyResult {
        return new HttpApiResponse(body, statusCode, headers).toResult(
            isBase64Encoded
        )
    }

    public static error(err: any): APIGatewayProxyResult {
        return new HttpApiResponse(
            { error: err.message },
            StatusCodes.INTERNAL_SERVER_ERROR
        ).toResult()
    }

    public toResult(isBase64Encoded: boolean = false): APIGatewayProxyResult {
        return {
            isBase64Encoded: isBase64Encoded,
            body: this.body,
            statusCode: this.statusCode,
            headers: this.headersToObject(this.headers),
        }
    }

    private headersToObject(headers: any | Headers): any {
        let h = {}
        headers.forEach((v, n) => (h[n] = v))
        return h
    }
}
