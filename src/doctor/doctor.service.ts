import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from 'src/entities/doctors.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Brackets, DataSource, IsNull, Not, QueryResult, Repository } from 'typeorm';
import { Role, peran } from 'src/entities/roles.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Spesialist } from 'src/entities/spesialists.entity';
import { join } from 'path';
import * as fs from 'fs';


@Injectable()
export class DoctorService {
  constructor(@InjectRepository(User)
  private userRepository: Repository<User>,

  @InjectRepository(Doctor)
  private doctorRepository: Repository<Doctor>,

  @InjectRepository(Role)
  private roleRepository: Repository<Role>,

  @InjectRepository(Spesialist)
  private spesialistRepository: Repository<Spesialist>,

  private readonly dataSource: DataSource
){}
  async create(createDoctorDto: CreateDoctorDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    // Mulai transaksi
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Periksa apakah email sudah terdaftar
      const existingUser = await this.userRepository.findOne({
        where: { email: createDoctorDto.email },
      });
      if (existingUser) {
        throw new HttpException('Email sudah terdaftar', HttpStatus.BAD_REQUEST);
      }
  
      // Buat user baru
      const user = new User();
      user.name = createDoctorDto.name;
      user.email = createDoctorDto.email;
      user.salt = uuidv4();
      user.password = bcrypt.hashSync(createDoctorDto.password + user.salt, 10);
      user.photo_profile = createDoctorDto.photo_profile;
      user.status = 0;
  
      // Periksa apakah role DOCTOR tersedia
      const doctorRole = await this.roleRepository.findOne({
        where: { name: peran.DOCTOR },
      });
      if (!doctorRole) {
        throw new HttpException('Role doctor tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      user.role = doctorRole;
  
      // Simpan user menggunakan QueryRunner
      const savedUser = await queryRunner.manager.save(User, user);
  
      // Periksa spesialisasi berdasarkan ID
      const spesialist = await this.spesialistRepository.findOne({
        where: { id: createDoctorDto.spesialist },
      });
      if (!spesialist) {
        throw new HttpException('Spesialisasi tidak ditemukan', HttpStatus.NOT_FOUND);
      }
  
      // Buat doctor baru
      const doctor = new Doctor();
      doctor.user = savedUser;
      doctor.spesialist = spesialist;
      doctor.experience = createDoctorDto.experience;
      doctor.alumnus = createDoctorDto.alumnus;
      doctor.no_str = createDoctorDto.no_str;  
      doctor.price = createDoctorDto.price || null;
      // Simpan doctor menggunakan QueryRunner
      await queryRunner.manager.save(Doctor, doctor);
  
      // Commit transaksi jika semua berhasil
      await queryRunner.commitTransaction();
  
      return savedUser;
    } catch (error) {
      // Rollback transaksi jika terjadi kesalahan
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Akhiri koneksi QueryRunner
      await queryRunner.release();
    }
  }
  
  
  async delete(doctorId: string): Promise<void> {
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    await this.doctorRepository.softDelete(doctorId);
  }

  async restore(doctorId: string): Promise<void> {
    const deletedDoctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      withDeleted: true,
    });
    if (!deletedDoctor) {
      throw new NotFoundException('Doctor not found or not deleted');
    }

    await this.doctorRepository.restore(doctorId);
  }

  async findDeletedDoctors(
    page: number = 1, 
    limit: number = 10, 
    search?: string,
  ): Promise<{ data: Doctor[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.doctorRepository.createQueryBuilder('doctor')
      .where('doctor.deleted_at IS NOT NULL')
      .withDeleted()
      .leftJoin('doctor.user', 'user')
      .addSelect([ 'user.name', 'user.photo_profile', 'user.email' ])
      .leftJoin('doctor.spesialist', 'spesialist')
      .addSelect(['spesialist.id', 'spesialist.name']);
  
    // Tambahkan kondisi pencarian jika `search` tidak kosong
    if (search) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('user.name LIKE :search', { search: `%${search}%` })
            .orWhere('spesialist.name LIKE :search', { search: `%${search}%` });
        })
      );
    }


    // Hitung total data
    const [doctors, total] = await queryBuilder.getManyAndCount();

    const baseUrl = 'http://localhost:8000';
    const transformedDoctors = doctors.map(doctor => {
      // Transform doctor's photo_profile if exists
      if (doctor.user.photo_profile) {
        doctor.user.photo_profile = `${baseUrl}/uploads/${doctor.user.photo_profile}`;
        if(!baseUrl){
          throw new Error('Base URL is not defined');
        }
      }

      return doctor;
    });
    queryBuilder.skip((page - 1) * limit).take(limit);
  
  
    return { 
      data: transformedDoctors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),};
  }
  
}
