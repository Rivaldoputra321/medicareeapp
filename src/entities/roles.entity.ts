import { Column, DeleteDateColumn, OneToMany, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { User } from "./users.entity";

export enum peran{
    ADMIN = 'ADMIN',
    PATIENT = 'PATIENT',
    DOCTOR = 'DOCTOR'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type:  'enum', enum: peran})
  name: peran;

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;
  
  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;

  @OneToMany(() => User, (user) => user.role)
  user: User[];
}