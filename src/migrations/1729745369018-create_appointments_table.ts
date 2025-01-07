import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAppointmentsTable1729745369018 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'appointments',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'doctorId',
                        type: 'uuid',
                        isNullable: false, 
                    },
                    {
                        name: 'patientId',
                        type: 'uuid',
                        isNullable: false, 
                    },
                    {
                        name: 'schedule',
                        type: 'timestamp',
                    },
                    {
                        name: 'note',
                        type: 'varchar',
                    },
                    {
                        name: 'link',
                        type: 'varchar',
                    },
                    {
                        name: 'total_price',
                        type: 'double precision', 
                    },
                    {
                        name: 'start',
                        type: 'timestamp',
                    },
                    {
                        name: 'end',
                        type: 'timestamp',
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
            true // Menghindari error jika tabel sudah ada
        );

        // Membuat foreign key relasi ke doctors
        await queryRunner.createForeignKey(
            'appointments',
            new TableForeignKey({
                columnNames: ['doctorId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'doctors',
                onDelete: 'CASCADE',
            })
        );

        // Membuat foreign key relasi ke patients
        await queryRunner.createForeignKey(
            'appointments',
            new TableForeignKey({
                columnNames: ['patientId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'patients',
                onDelete: 'CASCADE',
            })
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('appointments');
        const foreignKeyPatient = table.foreignKeys.find(fk => fk.referencedTableName === 'patients');
        if (foreignKeyPatient) {
            await queryRunner.dropForeignKey('appointments', foreignKeyPatient);
        }

        // Menghapus foreign key relasi ke doctors
        const foreignKeyDoctor = table.foreignKeys.find(fk => fk.referencedTableName === 'doctors');
        if (foreignKeyDoctor) {
            await queryRunner.dropForeignKey('appointments', foreignKeyDoctor);
        }

        // Menghapus tabel appointments
        await queryRunner.dropTable('appointments');

    }

}
