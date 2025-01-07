import { Column, DeleteDateColumn, Double, ManyToOne, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Patient } from "./patients.entity";
import { Doctor } from "./doctors.entity";


@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.appoinments, { onDelete: 'CASCADE' }) 
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appoinments, { onDelete: 'CASCADE' }) 
  patient: Patient;

  @Column()
  schedule:  Date;

  @Column()
  note: string;

  @Column()
  link: string;
  
  @Column({ type: 'numeric' }) // Menggunakan tipe numeric
  total_price: number;

  @Column()
  start: Date

  @Column()
  end: Date

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;

  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;
}