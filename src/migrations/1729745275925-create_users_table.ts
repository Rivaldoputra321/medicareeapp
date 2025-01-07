import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateUsersTable1729745275925 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'roleId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                    },
                    {
                        name: 'salt',
                        type: 'varchar',
                    },
                    {
                        name: 'photo_profile',
                        type: 'varchar',
                        isNullable: true,
                    },

                    {
                        name: 'status',
                        type: 'int', 
                        default: 0, 
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamp',
                        isNullable: true,
                    }
                ],
            }),
            
        );

        // Membuat foreign key relasi ke roles
        await queryRunner.createForeignKey(
            'users',
            new TableForeignKey({
                columnNames: ['roleId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'roles',
                onDelete: 'CASCADE',
            }),
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Menghapus foreign key relasi ke roles
        const table = await queryRunner.getTable('users');
        const foreignKeyRole = table.foreignKeys.find(fk => fk.referencedTableName === 'roles');
        if (foreignKeyRole) {
            await queryRunner.dropForeignKey('users', foreignKeyRole);
        }

        // Menghapus tabel users
        await queryRunner.dropTable('users');

    }

}
