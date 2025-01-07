import { Body, Controller, Get, Param, Post, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RefreshJwtGuard } from './guard/refresh.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/entities/users.entity';
import { JwtGuard } from './guard/authenticated.guard';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
   constructor(
      private authService: AuthService,
      private userService: UsersService,
    ) {}


    @Post('login')
    async login(@Body() authDto: AuthDto) {
      const user = await this.authService.validateUser(authDto);
      if (!user) {
        throw new UnauthorizedException('Email atau password salah');
      }
      
      return this.authService.login(user);
    }

    @Post('register')
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
      return this.userService.registerUser(createUserDto); // Pastikan method ini ada
    }

    @UseGuards(RefreshJwtGuard)
    @Post('refresh')
    async refreshToken(@Request() req) {
      console.log('refreshed');

      return await this.authService.refreshToken(req.user);
    }
   
    @UseGuards(JwtGuard)
    @Post('logout')
    async logout(@Request() req) {
        const token = req.headers.authorization?.split(' ')[1];
        return await this.authService.logout(token);
    }
}
