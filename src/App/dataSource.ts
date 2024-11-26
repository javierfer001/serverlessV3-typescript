import {DataSource} from "typeorm";
import {entities} from "src/Aggregate/Entities";
import {logger} from "src/lib/logger";

/**
 * AppDataSource is a singleton instance of DataSource
 * Remove synchronize: true in production
 */

export class Driver {
    static dataSource: DataSource

    static createDataSource() {
        return new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities,
            migrationsRun: true,
            synchronize: true,
            logging: false,
        })
    }

    static async connection(): Promise<DataSource> {
        logger.log('Driver.connection')

        if (!this.dataSource) {
            this.dataSource = Driver.createDataSource()
        }

        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize()
        }

        return this.dataSource
    }

    static async destroy() {
        await this.dataSource?.destroy()
    }
}
