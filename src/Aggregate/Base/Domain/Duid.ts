import { v4 as uuidv4 } from 'uuid'

export enum Ids {
    TOKEN = 'token',
    SQS = 'sqs',
    KEY = 'key',
}

export class Duid {
    constructor(public readonly value?: string) {}

    public static init(prefix: string = 'quill'): string {
        return `${prefix}_${uuidv4()}${new Date().getTime()}`
    }

    public static id(prefix: Ids): string {
        return RId.init(prefix)
    }

    public static token(): string {
        return `${Ids.TOKEN}_${uuidv4()}${new Date().getTime()}`
    }

    public static sqsId(): string {
        return `${Ids.SQS}_${uuidv4()}${new Date().getTime()}`
    }

    public static uniqueKey(): string {
        return `${Ids.KEY}_${uuidv4()}${new Date().getTime()}`
    }
}

export class RId extends Duid {
    constructor(public readonly value: string) {
        super(value)
    }
}
