import { ENVIRONMENT } from 'src/LambdaConfig'
import { AbstractCommand } from 'src/App/Base/AbstractCommand'
import { UserRepo } from 'src/Aggregate/User/Infra/UserRepo'
import { DataSource } from 'typeorm'
import { HttpApiContext } from 'src/aws-lambda/middle/HttpApiContext'
import { User } from 'src/Aggregate/User/Domain/User'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { secret, SecretAttrName } from 'src/lib/aws/AwsSecret'
import { logger } from 'src/lib/logger'

/**
 * Exchange the cognito token for a new token.
 */
export class LoginCommand extends AbstractCommand {
    static readonly NAME = 'login'
    static readonly METHOD = 'POST'

    public static createNewToken = ENVIRONMENT == 'prod'
    private readonly userRepo: UserRepo

    constructor(
        readonly driver: DataSource,
        readonly _: null,
        readonly context: HttpApiContext
    ) {
        super(null)
        this.userRepo = new UserRepo(driver)
    }

    async handler(): Promise<User> {
        const verifier = CognitoJwtVerifier.create({
            userPoolId: await secret.getValue(SecretAttrName.cognitoPoolId),
            tokenUse: 'id',
            clientId: await secret.getValue(SecretAttrName.getCognitoClientId),
        })

        const match = (this.context.headers.get('authorization') ?? '').match(
            /^Bearer (.*)$/
        )
        if (!match) {
            logger.error('missing cognito bearer authorization token')
            throw new Error('missing authorization token')
        }

        const decodeToken: any = await verifier.verify(match[1])

        let user = await this.userRepo.findOneBy({
            email: decodeToken.email,
        })
        if (!user) {
            logger.error('The user does not exists', decodeToken.email)
            throw new Error('User not register in our system')
        }

        if (LoginCommand.createNewToken) {
            /**
             * Only recreated a user token in prod env.
             */
            user.setNewToken()
        }
        await this.userRepo.save(user)

        return this.userRepo.findOneByOrFail({
            id: user.id,
        })
    }
}
