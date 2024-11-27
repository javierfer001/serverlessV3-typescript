import { handler as publicHandler } from 'src/aws-lambda/handler/public'
import { logger } from 'src/lib/logger'
import { AppVersion } from 'src/App/appVersion'

describe('Test Public base API', () => {
    beforeEach(async () => {})

    afterEach(async () => {
        jest.restoreAllMocks()
    })

    it('Request App Version', async () => {
        expect.assertions(4)
        const jestMockLog = jest
            .spyOn(logger, 'log')
            .mockImplementation(() => {})
        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': process.env.PUBLIC_ACCESS_TOKEN,
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await publicHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(200)
        expect(result.body).toBe(JSON.stringify({ version: '0.0.1' }))

        expect(jestMockLog).toBeCalled()
        expect(jestMockLog).toBeCalledWith('Driver.connection')
    })

    it('Missing Public Token', async () => {
        const jestMockLog = jest
            .spyOn(logger, 'error')
            .mockImplementation(() => {})

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await publicHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(result.body).toBe(
            JSON.stringify({
                error: 'Public token is missing in the request header',
            })
        )

        expect(jestMockLog).toBeCalled()
        expect(jestMockLog.mock.calls).toEqual([
            [
                'Error Lambda: appVersionHandler',
                {
                    error: 'Public token is missing in the request header',
                },
            ],
        ])
    })

    it('Handler exception from Application', async () => {
        // Mock the Hello.sayHello function to throw an error
        jest.spyOn(AppVersion, 'version').mockImplementation(() => {
            return (() => {}) as any
        })

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': process.env.PUBLIC_ACCESS_TOKEN,
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await publicHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(result.body).toBe(
            JSON.stringify({
                error: 'invalid response body type, found function',
            })
        )
    })

    it('Failed using wrong public token', async () => {
        expect.assertions(2)

        let event: any = {
            headers: {
                'Content-Type': 'application/json',
                'public-token': `${process.env.PUBLIC_ACCESS_TOKEN}_error`,
            },
            pathParameters: {},
            body: JSON.stringify({}),
        }
        let result = await publicHandler(event, <any>{
            timeoutEarlyInMillis: 0,
        })
        expect(result.statusCode).toBe(500)
        expect(result.body).toBe(
            JSON.stringify({
                error: 'Public token is wrong, please contact the administrator',
            })
        )
    })
})
