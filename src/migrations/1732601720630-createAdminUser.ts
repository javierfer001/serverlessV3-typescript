import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateAdminUser1732601720630 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        isUnique: true,
                        primaryKeyConstraintName: 'PK_USER',
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'first',
                        isNullable: true,
                        type: 'varchar',
                    },
                    {
                        name: 'last',
                        isNullable: true,
                        type: 'varchar',
                    },
                    {
                        name: 'token',
                        isNullable: true,
                        type: 'varchar',
                    },
                    {
                        name: 'phone',
                        isNullable: true,
                        type: 'varchar',
                    },
                    {
                        name: 'phoneCode',
                        isNullable: true,
                        type: 'varchar',
                    },
                    {
                        name: 'phoneVerify',
                        default: false,
                        type: 'boolean',
                    },
                    {
                        name: 'referCode',
                        isNullable: true,
                        type: 'varchar',
                    },
                    {
                        name: 'role',
                        isNullable: true,
                        type: 'varchar',
                    },
                ],
            }),
            true
        )

        await queryRunner.createIndex(
            'user',
            new TableIndex({
                name: 'IDX_USER_PHONE',
                columnNames: ['phone'],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user')
    }
}
