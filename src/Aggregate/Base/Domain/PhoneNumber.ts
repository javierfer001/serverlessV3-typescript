import {logger} from "src/lib/logger";

const reg = /^\+1\d{10}$/

export class PhoneNumber {
    public readonly value: string | undefined
    constructor(_value: any) {
        if (!PhoneNumber.validator(_value)) {
            logger.error('The PhoneNumber does not valid')
            throw new Error(
                'The PhoneNumber is invalid',
            )
        }
        this.value = _value ?? this.value
    }

    static validator(phone?: string): boolean {
        return phone ? reg.test(phone): true
    }
}
