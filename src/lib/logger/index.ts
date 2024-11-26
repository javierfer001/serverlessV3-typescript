
const logFn = (tag: string, msg: string, ...args: any[]) => {
    if (process.env?.TEST_ENV === 'test') {
        return
    }
    console.log(tag, msg, args)
}

export const logger = {
    log: (msg: string, ...args: any[]) => {
        logFn('INFO', msg, args)
    },
    error: (msg: string, ...args: any[]) => {
        logFn('ERR', msg, args)
    },


}
