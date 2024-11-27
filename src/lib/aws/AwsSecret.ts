import {
    AWS_REGION,
    IS_OFFLINE,
    LOCALSTACK_URL,
    SECRET_CREDENTIALS,
} from 'src/LambdaConfig'
import {
    GetSecretValueCommand,
    SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'
import fs from 'fs'

const config = {
    region: AWS_REGION,
    apiVersion: '2017-10-17',
}

if (IS_OFFLINE) {
    Object.assign(config, {
        endpoint: `${LOCALSTACK_URL}`,
    })
}

const TTL_KEY = '__TTL__', // manually added to cache file
    CACHE_FILE = '/tmp/secrets-cache.json',
    SECRETS_CACHE_TTL = 60 * 60000 // expire in 1 hour

type SecretsMap = Map<string, string>

/**
 * AwsSecret class to manage secrets
 */
export class AwsSecret {
    private static _instance: AwsSecret

    private _secretMap: SecretsMap = new Map()

    private secretClient: SecretsManagerClient

    public static getInstance() {
        if (!AwsSecret._instance) {
            AwsSecret._instance = new AwsSecret()
        }
        return AwsSecret._instance
    }

    constructor() {
        this.secretClient = new SecretsManagerClient(config)
    }

    /**
     * Get secret value by name
     * @param name
     */
    public async get(name: string): Promise<string> {
        if (this.isExpired()) {
            await this.read()
        }

        return this._secretMap.get(name) as string
    }

    /**
     * Check if the cache is expired
     * @private
     */
    private isExpired(): boolean {
        return (
            this._secretMap.size == 0 ||
            parseInt(this._secretMap.get(TTL_KEY) ?? '0', 10) <=
                new Date().getTime()
        )
    }

    /**
     * Read secrets from cache or fetch from AWS
     * The cache will be expired after SECRETS_CACHE_TTL (1 hour)
     * @private
     */
    private async read() {
        if (this._secretMap.size == 0) {
            try {
                this._secretMap = this.createSecretMap(
                    fs.readFileSync(CACHE_FILE, 'utf8')
                )
                if (!this.isExpired()) return
            } catch (err) {
                if (err.code !== 'ENOENT')
                    // "no such file or directory" errors ignored, so they can be fetched
                    throw err
            }
        }
        await this.fetch()
    }

    /**
     * Fetch secrets from AWS
     * @private
     */
    private async fetch() {
        let command = new GetSecretValueCommand({
                SecretId: SECRET_CREDENTIALS,
            }),
            output = await this.secretClient.send(command)

        if (!output.SecretString) {
            throw new Error(`missing ${SECRET_CREDENTIALS} secret`)
        }

        this.createSecretMap(output.SecretString)

        this.save()
    }

    /**
     * Create a secret map from the secret string
     * @param secret
     */
    public createSecretMap(secret: string): SecretsMap {
        let map: SecretsMap = new Map(Object.entries(JSON.parse(secret)))
        map.set(TTL_KEY, (new Date().getTime() + SECRETS_CACHE_TTL).toString())
        this._secretMap = map
        return this._secretMap
    }

    /**
     * Save the secret map to cache /tmp/secrets-cache.json
     * @private
     */
    private save(): void {
        try {
            let secret = JSON.stringify(Object.fromEntries(this._secretMap))
            fs.writeFileSync(CACHE_FILE, secret, {
                encoding: 'utf8',
                flag: 'wx',
            })
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }
}
export const secret = AwsSecret.getInstance()
