import { Column, DeleteDateColumn, OneToMany, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Doctor } from "./doctors.entity";

@Entity('spesialists')
export class Spesialist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;

  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;

  
  @OneToMany(() => Doctor, (doctor) => doctor.spesialist)
  doctor: Doctor[];
}