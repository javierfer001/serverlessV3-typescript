import {handler as mainHandler} from "src/aws-lambda/handler/main";
import {logger} from "src/lib/logger";
import {Hello} from "src/App/hello";

describe('Test base API', () => {

    beforeEach(async () => {
    })

    afterEach(async () => {
        jest.restoreAllMocks()
    })

    it('Request Hello World', async () => {
        expect.assertions(4)
        const jestMockLog = jest.spyOn(logger, 'log').mockImplementation(() => {})
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': process.env.PUBLIC_ACCESS_TOKEN
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(200)
        expect(result.body).toBe(JSON.stringify({message: 'Hello World!'}))

        expect(jestMockLog).toBeCalled()
        expect(jestMockLog).toBeCalledWith('Hello World!')
    })

    it('Missing Public Token', async () => {
        const jestMockLog = jest.spyOn(logger, 'error').mockImplementation(() => {})

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(result.body).toBe(JSON.stringify({error: 'Public token is missing in the request header'}))

        expect(jestMockLog).toBeCalled()
        expect(jestMockLog.mock.calls).toEqual([
            [
                "Error Lambda: main",
                {
                    "error": "Public token is missing in the request header"
                }
            ]
        ])
    })

    it('Handler exception from Application', async () => {
        // Mock the Hello.sayHello function to throw an error
        jest.spyOn(Hello, 'sayHello').mockImplementation(() => {
            return (() => {error: 'Error from Application'}) as any
        })

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': process.env.PUBLIC_ACCESS_TOKEN
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(result.body).toBe(JSON.stringify({"error":"invalid response body type, found function"}))
    })

    it('Failed using wrong public token', async () => {
        expect.assertions(2)

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': `${process.env.PUBLIC_ACCESS_TOKEN}_error`
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await mainHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(result.body).toBe(JSON.stringify({"error":"Public token is wrong, please contact the administrator"}))
    })
})
