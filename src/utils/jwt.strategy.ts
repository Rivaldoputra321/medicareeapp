import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.jwtSecretKey, // Tambahkan JWT_SECRET di .env Anda
    });
  }

  async validate(payload: any) {
    return await this.userService.findUserById(payload.sub); // Mendapatkan user berdasarkan ID di token
  }
}
