import { strict as assert } from 'assert'

export const PUBLIC_APP_NAME = 'My App'

// This is aws secret manager secret name
export const SECRET_CREDENTIALS = process.env.SECRET_CREDENTIALS
assert(SECRET_CREDENTIALS, 'SECRET_CREDENTIALS env var must be set')

// AWS Account ID and region
export const ACCOUNT_ID = String(process.env?.AWS_ACCOUNT_ID)
export const AWS_REGION = process.env.REGION ?? 'us-east-1'

// Public access token for the app
export const PUBLIC_ACCESS_TOKEN = process.env.PUBLIC_ACCESS_TOKEN
assert(PUBLIC_ACCESS_TOKEN, 'PUBLIC_ACCESS_TOKEN env var must be set')

export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'dev'
assert(ENVIRONMENT, 'ENVIRONMENT env var must be set')

// Testing settings
export const IS_OFFLINE = !!process.env.IS_OFFLINE
export const LOCALSTACK_URL = process.env.IS_OFFLINE
    ? 'http://127.0.0.1:4566'
    : null
