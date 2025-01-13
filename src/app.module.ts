import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SpesialistModule } from './spesialist/spesialist.module';
import { DoctorModule } from './doctor/doctor.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Appointment } from './entities/appoinments.entity';
import { Doctor } from './entities/doctors.entity';
import { Patient } from './entities/patients.entity';
import { Role } from './entities/roles.entity';
import { Spesialist } from './entities/spesialists.entity';
import { User } from './entities/users.entity';
import { source } from './data-source';
import { PatientModule } from './patient/patient.module';
import { Transaction } from './entities/transactions.entity';
import { AppointmentModule } from './appointment/appointment.module';
import { MidtransModule } from './midtrans/midtrans.module';
import { EmailModule } from './email/email.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, TypeOrmModule.forRoot(source.options),],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [User, Role, Spesialist, Doctor, Patient, Appointment, Transaction],
        migrations: ['dist/migrations/*.js'],
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    SpesialistModule,
    DoctorModule,
    PatientModule,
    AppointmentModule,
    MidtransModule,
    EmailModule,
  ],
})
export class AppModule {}
