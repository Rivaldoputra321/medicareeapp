import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entities/roles.entity';
import { User } from 'src/entities/users.entity';
import { Patient } from 'src/entities/patients.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User,Role,Patient])],
  controllers: [PatientController],
  providers: [PatientService, JwtService],
})
export class PatientModule {}
