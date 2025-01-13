import { Column, DeleteDateColumn, JoinColumn, OneToMany, OneToOne, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { User } from "./users.entity";
import { Appointment } from "./appoinments.entity";

export enum genders{
    male = 'male',
    female = 'female',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn() 
  user: User;

  @Column()
  date_of_birth:  Date;

  @Column({type: 'enum', enum : genders})
  gender: genders;

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;

  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;

  @OneToMany(() => Appointment, (appoinments) => appoinments.patient)
  appoinments: Appointment[];
  patient: Patient;
}