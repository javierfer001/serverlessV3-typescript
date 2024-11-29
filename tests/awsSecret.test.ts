import {
    GetSecretValueCommand,
    SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'
import { mockClient } from 'aws-sdk-client-mock'
import { AwsSecret, secret } from 'src/lib/aws/AwsSecret'

import fs from 'fs'

describe('Test AWS secret manager', () => {
    let readFileSyncMock: jest.SpyInstance

    beforeEach(async () => {
        readFileSyncMock = jest
            .spyOn(fs, 'readFileSync')
            .mockImplementation((cache: string) => {
                const error = new Error(
                    `ENOENT: no such file or directory, open '${cache}'`
                ) as NodeJS.ErrnoException
                error.code = 'ENOENT'
                error.errno = -2
                error.syscall = 'open'
                error.path = cache
                throw error
            })

        jest.spyOn(fs, 'writeFileSync')
    })

    afterEach(async () => {
        jest.restoreAllMocks()
    })

    it('AWS secret manager', async () => {
        const secretManagerMock = mockClient(SecretsManagerClient as any)
        secretManagerMock.on(GetSecretValueCommand as any).resolves({
            SecretString: JSON.stringify({
                secret: 'value',
            }),
        } as any)

        let value = await secret.getValue('secret')
        expect(value).toEqual('value')

        expect(readFileSyncMock.mock.calls[0]).toEqual([
            '/tmp/secrets-cache.json',
            {
                encoding: 'utf8',
            },
        ])
        readFileSyncMock.mockClear()

        value = await secret.getValue('secret')
        expect(value).toEqual('value')
        expect(readFileSyncMock).not.toHaveBeenCalled()
    })
    it('AWS wrong secret string', async () => {
        // Reset singleton instance
        let secret = AwsSecret.getInstance(true)
        const secretManagerMock = mockClient(SecretsManagerClient as any)
        secretManagerMock.on(GetSecretValueCommand as any).resolves({} as any)

        let errorMsg = ''
        try {
            await secret.getValue('secret')
        } catch (error) {
            errorMsg = error.message
        }
        expect(errorMsg).toEqual('missing test-secret-credentials secret')

        readFileSyncMock.mockClear()
    })
})
