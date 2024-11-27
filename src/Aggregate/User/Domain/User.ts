import {
    BeforeInsert,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Model } from 'src/Aggregate/Base/Domain/Model'
import { Duid } from 'src/Aggregate/Base/Domain/Duid'
import { PUBLIC_APP_NAME } from 'src/LambdaConfig'

export enum Role {
    admin = 'admin',
    manager = 'manager',
    system = 'system',
}

@Entity({
    name: 'user',
})
export class User extends Model {
    @PrimaryGeneratedColumn('uuid', {
        primaryKeyConstraintName: 'PK_USER',
    })
    id!: string

    @Column({
        nullable: true,
    })
    first?: string

    @Column({
        nullable: true,
    })
    last?: string

    @Column({
        unique: true,
        nullable: true,
    })
    token: string

    @Index('IDX_USER_PHONE', {
        unique: true,
    })
    @Column({
        nullable: true,
    })
    phone?: string

    @Column({
        nullable: true,
    })
    phoneCode?: string

    @Column({
        type: 'boolean',
        default: false,
    })
    phoneVerify?: boolean

    @Column({
        nullable: true,
    })
    role: Role

    @BeforeInsert()
    beforeSave() {
        if (!this.token) {
            this.setNewToken()
        }
    }

    setNewToken() {
        Object.assign(this, { token: Duid.token() })
    }

    static generateVerificationCode(): string {
        let code = String(10000 + Math.floor(Math.random() * 90000))
        while (code.length < 5) code = '0' + code
        return code.slice(0, 5)
    }

    msgVerificationCode(): string {
        return `[${PUBLIC_APP_NAME}]: ${this?.phoneCode} is your verification code.`
    }

    verifyPhoneCode(code: string): void {
        this.phoneVerify = this.phoneCode == code
        if (!this.phoneVerify) {
            throw new Error('The verification code is incorrect')
        }
        this.phoneCode = ''
    }
}
