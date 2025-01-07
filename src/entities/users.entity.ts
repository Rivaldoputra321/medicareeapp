import { generate } from "rxjs";
import { BeforeInsert, Column, DeleteDateColumn, ManyToOne, OneToOne, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { v4 as uuidv4 } from 'uuid';
import { Role } from "./roles.entity";
import { Patient } from "./patients.entity";
import { Doctor } from "./doctors.entity";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export enum statusUser{
    ONLINE = 1,
    OFFLINE = 0
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Role, (role) => role.user, { onDelete: 'CASCADE' }) 
  role: Role;

  @Column({ nullable: false })
  roleId: string; 

  @Column()
  name: string;

  @Column({unique: true})
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({nullable: true})
  photo_profile: string;

  @Column()
  status: number;

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;

  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;

//   @BeforeInsert()
// async hashPassword() {
//   if (!this.salt && !this.password.match(/^[a-f0-9]{64}$/)) {
//     this.salt = uuidv4(); // Generate salt hanya jika belum ada
//     this.password = crypto
//       .createHmac('sha256', this.salt)
//       .update(this.password)
//       .digest('hex');
//   }
// }



  @OneToOne(() => Patient, (patients) => patients.user)
  patient: Patient;

  @OneToOne(() => Doctor, (doctors) => doctors.user)
  doctor: Doctor;

}