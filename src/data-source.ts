import { DataSource } from 'typeorm';
import { Role } from './entities/roles.entity';
import { Doctor } from './entities/doctors.entity';
import { Patient } from './entities/patients.entity';
import { Appointment } from './entities/appoinments.entity';
import { User } from './entities/users.entity';
import { Spesialist } from './entities/spesialists.entity';


export const source  = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '16781741',
  database: 'medicare',
  entities: [Role, User, Patient, Doctor, Appointment, Spesialist],
  migrations: ['dist/migrations/*.js'], // tentukan di mana migrasi akan disimpan
  synchronize: false,
});
