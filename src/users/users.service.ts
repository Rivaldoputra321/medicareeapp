import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { peran, Role } from 'src/entities/roles.entity';
import { Patient } from 'src/entities/patients.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    try{
      const user = new User();
      user.name = createUserDto.name;
      user.email = createUserDto.email;
      user.salt = uuidv4();
      user.password = await bcrypt.hash(createUserDto.password + user.salt, 10);
      user.status = 0;
  
      const patientRole = await this.roleRepository.findOne({ where: { name: peran.PATIENT } });
      if (!patientRole) {
        throw new HttpException('Role PATIENT tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      const existingUser = await this.userRepository.findOne({
        where: { email: user.email },
      });
      if (existingUser) {
        throw new HttpException('Email sudah terdaftar', HttpStatus.BAD_REQUEST); 
      }
      
      user.role = patientRole;
  
      const savedUser = await this.userRepository.save(user);
  
      const patient = new Patient();
      patient.user = savedUser;
      patient.date_of_birth = createUserDto.date_of_birth;
      patient.gender = createUserDto.gender;
      patient.telp = createUserDto.telp;
  
      await this.patientRepository.save(patient);
  
      return savedUser;
    }
    catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['patient', 'doctor'],
    });

    if (!user) {
      throw new HttpException('User tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  // Fungsi untuk memperbarui status user
  async updateUserStatus(id: string, status: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('User tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    user.status = status;
    return this.userRepository.save(user);
  }
}
