/**
 * Check api version
 */
export class ApiVersionHandler {
    static readonly NAME = 'version'
    static readonly METHOD = 'POST'

    constructor() {}

    async handler(): Promise<any> {
        return { version: '0.0.1' }
    }
}
