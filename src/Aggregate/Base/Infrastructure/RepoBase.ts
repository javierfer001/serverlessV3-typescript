import 'reflect-metadata'
import { EntityManager, Repository } from 'typeorm'
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral'
import { EntityTarget } from 'typeorm/common/EntityTarget'
import { logger } from 'src/lib/logger'

export const withTimeout = <T>(timeoutMs: number, promise: any): Promise<T> => {
    const timeoutPromise = new Promise<T>((resolve) => {
        setTimeout(() => {
            logger.log('The send Msg is timeout')
            resolve('timeout' as any as T)
        }, timeoutMs)
    })
    logger.log('The send Msg is timeout Promise.race')
    return Promise.race([promise, timeoutPromise])
}

export class RepoBase<Entity extends ObjectLiteral> extends Repository<Entity> {
    protected repo: Repository<Entity>
    constructor(target: EntityTarget<Entity>, manager: EntityManager) {
        super(target, manager)
        this.repo = manager.getRepository<Entity>(target)
    }
}
