import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { Appointment } from 'src/entities/appoinments.entity';
import { MidtransModule } from 'src/midtrans/midtrans.module';
import { Transaction } from 'src/entities/transactions.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/entities/roles.entity';
import { Doctor } from 'src/entities/doctors.entity';
import { Patient } from 'src/entities/patients.entity';
import { User } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Transaction, Role, Doctor, Patient]),
    EmailModule,
    UsersModule,
    MidtransModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, JwtService],
})
export class AppointmentModule {}
