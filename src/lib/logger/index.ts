export const logger = {
    log: (msg: string, ...args: any[]) => {
        console.log('INFO', msg, args)
    },
    error: (msg: string, ...args: any[]) => {
        console.error('ERR', msg, args)
    },
}
