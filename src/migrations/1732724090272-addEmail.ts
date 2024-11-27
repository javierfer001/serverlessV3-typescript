import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableIndex,
} from 'typeorm'
import { Role, User } from 'src/Aggregate/User/Domain/User'

export class AddEmail1732724090272 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'email',
                type: 'varchar',
            })
        )
        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'username',
                type: 'varchar',
                isNullable: true,
            })
        )

        await queryRunner.createIndex(
            'user',
            new TableIndex({
                name: 'IDX_USERS_EMAIL',
                columnNames: ['email'],
                isUnique: true,
            })
        )

        const userRepo = queryRunner.manager.getRepository(User)
        const admin = new User()
        admin.role = Role.admin
        admin.first = 'Javier'
        admin.last = 'Fdz'
        admin.phone = '+1234567890'
        admin.phoneVerify = true
        admin.email = 'admin@company.domain.com'
        admin.token = 'token_8b4833a8-349c-4c19-bc4d-d680b1a3d9d21732602396310'
        await userRepo.save(admin)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('user', 'IDX_USERS_EMAIL')
        await queryRunner.dropColumn('user', 'email')
        await queryRunner.dropColumn('user', 'username')
    }
}
