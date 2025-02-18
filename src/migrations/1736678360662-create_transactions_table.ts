import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTransactionsTable1736678360662 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "transactions",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid"
                    },
                    {
                        name: "appointment_id",
                        type: "uuid",
                        isUnique: true
                    },
                    {
                        name: "amount",
                        type: "decimal",
                        precision: 10,
                        scale: 2
                    },
                    {
                        name: "midtrans_order_id",
                        type: "varchar",
                        isUnique: true,
                        isNullable: true
                    },
                    {
                        name: "midtrans_transaction_id",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: [
                            "PENDING",
                            "SETTLEMENT",
                            "CAPTURE",
                            "DENY",
                            "CANCEL",
                            "EXPIRE",
                            "FAILURE",
                            "REFUND",
                            "PARTIAL_REFUND",
                            "CHARGEBACK",
                            "PARTIAL_CHARGEBACK"
                        ],
                        default: "'PENDING'"
                    },
                    {
                        name: "payment_method",
                        type: "varchar",
                        isNullable: true
                    },

                    {
                        name: "payment_link",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "admin_fee",
                        type: "decimal",
                        precision: 10,
                        scale: 2
                    },
                    {
                        name: "doctor_fee",
                        type: "decimal",
                        precision: 10,
                        scale: 2
                    },
                    {
                        name: "paid_at",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "refund_id",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "refunded_at",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true
                    }
                ]
            })
        );

        // Add foreign key for appointment
        await queryRunner.createForeignKey(
            "transactions",
            new TableForeignKey({
                columnNames: ["appointment_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "appointments",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("transactions");
        const foreignKeys = table.foreignKeys;
        
        await Promise.all(
            foreignKeys.map(foreignKey => 
                queryRunner.dropForeignKey("transactions", foreignKey)
            )
        );
        
        await queryRunner.dropTable("transactions");
    }

}
