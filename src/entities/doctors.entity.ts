import { Column, DeleteDateColumn, Double, IntegerType, JoinColumn, ManyToOne, OneToMany, OneToOne, Timestamp } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { User } from "./users.entity";
import { Appointment } from "./appoinments.entity";
import { Spesialist } from "./spesialists.entity";

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Spesialist, (spesialist) => spesialist.doctor, { onDelete: 'CASCADE' }) 
  spesialist: Spesialist;

  @Column({type: 'int'})
  experience: number;

  @Column()
  alumnus: string;

  @Column({unique: true})
  no_str: string

  @Column({ type: 'numeric', nullable: true }) 
  price: number; 

  @Column({type: 'timestamp', default:() =>  'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'} )
  updated_at: Date;

  @DeleteDateColumn({type: 'timestamp', nullable: true})
  deleted_at?: Date;

  @OneToMany(() => Appointment, (appoinments) => appoinments.doctor)
  appoinments: Appointment[];
}