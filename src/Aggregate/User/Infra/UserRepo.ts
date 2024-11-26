import {DataSource} from 'typeorm'
import {User} from 'src/Aggregate/User/Domain/User'
import {PhoneNumber} from "src/Aggregate/Base/Domain/PhoneNumber";
import {RepoBase} from "src/Aggregate/Base/Infrastructure/RepoBase";


export class UserRepo extends RepoBase<User> {
    constructor(readonly dataSource: DataSource) {
        super(User, dataSource.manager)
    }

    async setNewPhoneNumber(user: User, phoneNumber: PhoneNumber) {
        if (phoneNumber.value) {
            user.phone = phoneNumber.value
            user.phoneCode = User.generateVerificationCode()
            user.phoneVerify = false
        }
    }
}
