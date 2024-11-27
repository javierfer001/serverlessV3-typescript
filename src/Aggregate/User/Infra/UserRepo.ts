import { DataSource } from 'typeorm'
import { User } from 'src/Aggregate/User/Domain/User'
import { PhoneNumber } from 'src/Aggregate/Base/Domain/PhoneNumber'
import {
    RepoBase,
    withTimeout,
} from 'src/Aggregate/Base/Infrastructure/RepoBase'
import { awsMsg } from 'src/lib/aws/AwsMsg'

export class UserRepo extends RepoBase<User> {
    constructor(readonly dataSource: DataSource) {
        super(User, dataSource.manager)
    }

    async setNewPhoneNumber(user: User, phoneNumber: PhoneNumber) {
        if (phoneNumber.value) {
            user.phone = phoneNumber.value
            user.phoneCode = User.generateVerificationCode()
            user.phoneVerify = false

            // Send SMS Notification
            await withTimeout<any>(
                1000,
                awsMsg.sendSms(user.phone, user.msgVerificationCode())
            )
        }
    }

    async resendVerificationCode(user: User) {
        if (user.phone && !user.phoneVerify) {
            user.phoneCode = User.generateVerificationCode()

            await this.save(user)
            // Send SMS Notification
            await withTimeout<any>(
                1000,
                awsMsg.sendSms(user.phone, user.msgVerificationCode())
            )
        }
    }
}
