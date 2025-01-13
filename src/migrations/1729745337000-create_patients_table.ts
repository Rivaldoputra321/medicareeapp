import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePatientsTable1729745337000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'patients',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'date_of_birth',
                        type: 'date',
                    },
                    {
                        name: 'gender',
                        type: 'enum',
                        enum: ['male', 'female'],
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
            'patients',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('patients');
        const foreignKeyUser = table.foreignKeys.find(fk => fk.referencedTableName === 'users');
        if (foreignKeyUser) {
            await queryRunner.dropForeignKey('patients', foreignKeyUser);
        }

        // Menghapus tabel patients
        await queryRunner.dropTable('patients');
    }

}
