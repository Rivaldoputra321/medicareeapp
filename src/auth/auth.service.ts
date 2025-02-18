import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { peran } from 'src/entities/roles.entity';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Fungsi untuk validasi pengguna berdasarkan email dan password
  async validateUser(authDto: AuthDto): Promise<User | null> {
    try {
      const user = await this.userService.findUserByEmail(authDto.email);
      if (!user) {
        console.log('User not found');
        return null;
      }

      console.log('Password from input:', authDto.password);
      console.log('Hashed password from DB:', user.password);

      // Bandingkan password yang dimasukkan dengan hash password di database
      const isPasswordValid = await bcrypt.compare(authDto.password + user.salt, user.password);

      if (isPasswordValid) {
        return user;  // Passwords match
      }

      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // Fungsi untuk login dan menghasilkan JWT token
  async login(user: User) {
    try {
      user.status = 1; // Set user status as inactive
      await this.userService.updateUserStatus(user.id, 1);  // Set user status as active (logged in)
    
      // Payload untuk JWT
      
      const baseUrl = 'http://localhost:8000';

      const payload = { 
        sub: user.id, 
        email: user.email, 
        roleId: user.roleId, 
        name: user.name,
        // Tambahkan full URL untuk photo_profile jika ada
        photo_profile: user.roleId === peran.DOCTOR 
          ? `${baseUrl}/uploads/doctors/${user.photo_profile}` 
          : `${baseUrl}/uploads/patient/${user.photo_profile}`,
      };
      
      // Membuat token JWT dengan masa berlaku 1 jam
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.jwtSecretKey, 
        expiresIn: '1h',
      });
      
      // Membuat refresh token dengan masa berlaku 7 hari
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.jwtRefreshTokenKey, 
        expiresIn: '7d',
      });
      

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error('Error during login:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  // Fungsi untuk refresh token
  async refreshToken(refresh_token: string) {
    try {
      // Verifikasi refresh token untuk mendapatkan payload
      const decoded = await this.jwtService.verifyAsync(refresh_token, {
        secret: process.env.jwtRefreshTokenKey,
      });
  
      // Validasi payload dan dapatkan informasi user
      const user = await this.userService.findUserById(decoded.sub); // Sesuaikan dengan service Anda
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      const baseUrl = 'http://localhost:8000';

      const payload = { 
        sub: user.id, 
        email: user.email, 
        roleId: user.roleId, 
        name: user.name,
        // Tambahkan full URL untuk photo_profile jika ada
        photo_profile: user.roleId === peran.DOCTOR 
          ? `${baseUrl}/uploads/doctors/${user.photo_profile}` 
          : `${baseUrl}/uploads/patient/${user.photo_profile}`,
      };
  
      // Generate tokens baru
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
        secret: process.env.jwtSecretKey,
      });
  
      const newRefreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.jwtRefreshTokenKey,
      });
  
      // Kirim response dengan token baru
      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 hari
      };
    } catch (error) {
      console.error('Error refreshing token:', error.message);
      throw new UnauthorizedException('Token refresh failed');
    }
  }
  

  // Fungsi untuk logout
  async logout(token: string) {
    try {
      // Verifikasi dan decode token untuk mendapatkan detail pengguna
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.jwtSecretKey,
      });
      const user = await this.userService.findUserById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Update user status in database (logout logic can vary based on implementation)
      user.status = 0; // Set user status as inactive
      await this.userService.updateUserStatus(user.id, 0);
      return {
        message: 'Logged out successfully',
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error during logout:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
