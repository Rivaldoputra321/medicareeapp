import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDoctorsTable1729745326207 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'doctors',
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
                        isNullable: false, // Harus ada, karena relasi ke user
                    },
                    {
                        name: 'spesialistId',
                        type: 'uuid',
                        isNullable: false, // Harus ada, karena relasi ke spesialis
                    },
                    {
                        name: 'experience',
                        type: 'int',
                    },
                    {
                        name: 'no_str',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'alumnus',
                        type: 'varchar',
                    },
                    {
                        name: 'price',
                        type: 'double precision',
                        isNullable: true
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
             // Menghindari error jika tabel sudah ada
        );

        // Membuat foreign key relasi ke users
        await queryRunner.createForeignKey(
            'doctors',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        // Membuat foreign key relasi ke specialists
        await queryRunner.createForeignKey(
            'doctors',
            new TableForeignKey({
                columnNames: ['spesialistId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'spesialists',
                onDelete: 'CASCADE',
            })
        );

        // Membuat foreign key relasi ke hospitals

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('doctors');

        // Menghapus foreign key relasi ke specialists
        const foreignKeySpecialist = table.foreignKeys.find(fk => fk.referencedTableName === 'specialists');
        if (foreignKeySpecialist) {
            await queryRunner.dropForeignKey('doctors', foreignKeySpecialist);
        }

        // Menghapus foreign key relasi ke users
        const foreignKeyUser = table.foreignKeys.find(fk => fk.referencedTableName === 'users');
        if (foreignKeyUser) {
            await queryRunner.dropForeignKey('doctors', foreignKeyUser);
        }

        // Menghapus tabel doctors
        await queryRunner.dropTable('doctors');

    }

}
