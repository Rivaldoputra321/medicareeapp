import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Role } from 'src/entities/roles.entity';
import { Patient } from 'src/entities/patients.entity';

@Module({
  imports :  [TypeOrmModule.forFeature([User,Role,Patient])],
  exports : [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
