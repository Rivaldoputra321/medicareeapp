import { AppointmentStatus } from "src/entities/appoinments.entity";
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAppointmentsTable1729745369018 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE appointment_status_enum AS ENUM (
                'PENDING', 
                'APPROVED', 
                'REJECTED', 
                'RESCHEDULED', 
                'AWAITING_PAYMENT', 
                'PAID', 
                'IN_PROGRESS', 
                'COMPLETED',
                'CANCELLED',
                'AWAITING_JOIN_LINK'
            );
        `);
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
                        name: "status",
                        type: "enum",
                        enumName: "appointment_status_enum",
                        enum: [
                            'PENDING', 
                            'APPROVED', 
                            'REJECTED', 
                            'RESCHEDULED',
                            'AWAITING_PAYMENT',
                            'PAID',
                            'IN_PROGRESS',
                            'COMPLETED',
                            'CANCELLED',
                            'AWAITING_JOIN_LINK'
                        ],
                        default: "'PENDING'::appointment_status_enum"
                    },
                    {
                        name: "diagnosis",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "note",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "rejection_reason",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "meeting_link",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "meeting_link_expired",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "link_sent_at",
                        type: "timestamp",
                        isNullable: true
                    },
                    
                    {
                        name: "reschedule_count",
                        type: "int",
                        default: 0
                    },
                    {
                        name: "is_patient_present",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: "is_doctor_present",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: 'patient_joint_time',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: true
                    },
                    {
                        name: 'doctor_join_time',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: true
                    },
                    {
                        name: 'started_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: true
                    },

                    {
                        name: 'completed_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
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
