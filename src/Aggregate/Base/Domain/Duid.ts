import { v4 as uuidv4 } from 'uuid'

export enum Ids {
    TOKEN = 'token',
}

export class Duid {
    public static token(): string {
        return `${Ids.TOKEN}_${uuidv4()}${new Date().getTime()}`
    }
}
