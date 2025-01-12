import { Module } from '@nestjs/common';
import { SpesialistService } from './spesialist.service';
import { SpesialistController } from './spesialist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spesialist } from 'src/entities/spesialists.entity';
import { Doctor } from 'src/entities/doctors.entity';
import { User } from 'src/entities/users.entity';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  imports :  [TypeOrmModule.forFeature([Spesialist,Doctor, User]), DoctorModule],
  controllers: [SpesialistController],
  providers: [SpesialistService],
})
export class SpesialistModule {}
