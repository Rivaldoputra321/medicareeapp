import { Column, DeleteDateColumn, Double, JoinColumn, ManyToOne, OneToOne, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Patient } from "./patients.entity";
import { Doctor } from "./doctors.entity";
import { Transaction } from "./transactions.entity";

export enum AppointmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESCHEDULED = 'RESCHEDULED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}


@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.appoinments, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appoinments, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  schedule:  Date;

  @Column({ nullable: true })
  rejection_reason: string;

  @Column({ nullable: true })
  meeting_link: string;

  @Column({ type: 'timestamp', nullable: true })
  meeting_link_expired: Date;

  @Column({ type: 'timestamp', nullable: true })
  link_sent_at: Date;
  

  @Column({ default: 0 })
  reschedule_count: number;

  @Column({ default: false })
  is_patient_present: boolean;

  @Column({ default: false })
  is_doctor_present: boolean;

  @OneToOne(() => Transaction, (transaction) => transaction.appointment)
  transaction: Transaction;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING
  })
  status: AppointmentStatus;

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;

  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;
}