import { Column, DeleteDateColumn, Double, IntegerType, JoinColumn, ManyToOne, OneToMany, OneToOne, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { User } from "./users.entity";
import { Appointment } from "./appoinments.entity";
import { Spesialist } from "./spesialists.entity";

export enum PaymentStatus {
    PENDING = 'PENDING',           // Menunggu pembayaran
    SETTLEMENT = 'SETTLEMENT',     // Pembayaran berhasil
    CAPTURE = 'CAPTURE',          // Pembayaran via kartu kredit berhasil
    DENY = 'DENY',               // Pembayaran ditolak
    CANCEL = 'CANCEL',           // Pembayaran dibatalkan
    EXPIRE = 'EXPIRE',           // Pembayaran expired
    FAILURE = 'FAILURE',         // Pembayaran gagal
    REFUND = 'REFUND',          // Pembayaran dikembalikan
    PARTIAL_REFUND = 'PARTIAL_REFUND',  // Pembayaran dikembalikan sebagian
    CHARGEBACK = 'CHARGEBACK',   // Pembayaran di-chargeback
    PARTIAL_CHARGEBACK = 'PARTIAL_CHARGEBACK'  // Pembayaran di-chargeback sebagian
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @OneToOne(() => Appointment, appointment => appointment.transaction)
    @JoinColumn()
    appointment: Appointment;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number; 
  
    @Column()
    midtransOrderId: string;
  
    @Column({ nullable: true })
    midtransTransactionId: string;
  
    @Column({
      type: 'enum',
      enum: PaymentStatus,
      default: PaymentStatus.PENDING
    })
    status: PaymentStatus;
  
    @Column({ nullable: true })
    paymentMethod: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    adminFee: number; // 10% dari doctor.price
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    doctorFee: number; // 90% dari doctor.price (sesuai price_received di doctor entity)
  
    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date;
  
    @Column({ nullable: true })
    refundId: string;
  
    @Column({ type: 'timestamp', nullable: true })
    refunded_at: Date;

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;

  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;

}