import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Doctor } from 'src/entities/doctors.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entities/roles.entity';
import { User } from 'src/entities/users.entity';
import { Spesialist } from 'src/entities/spesialists.entity';
import { JwtService } from '@nestjs/jwt';


@Module({
  imports :  [TypeOrmModule.forFeature([User,Role,Doctor,Spesialist]),],
  controllers: [DoctorController],
  providers: [DoctorService, JwtService],
})
export class DoctorModule {}
