import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from 'src/utils/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    UsersModule
  ],
  providers: [AuthService, JwtService],
  controllers: [ AuthController]
})
export class AuthModule {}
