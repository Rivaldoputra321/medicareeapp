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
// doctor.service.ts
async create(createDoctorDto: CreateDoctorDto): Promise<User> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { email: createDoctorDto.email },
    });
    
    if (existingUser) {
      throw new HttpException('Email sudah terdaftar', HttpStatus.BAD_REQUEST);
    }

    const doctorRole = await queryRunner.manager.findOne(Role, {
      where: { name: peran.DOCTOR },
    });
    
    if (!doctorRole) {
      throw new HttpException('Role doctor tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const spesialist = await queryRunner.manager.findOne(Spesialist, {
      where: { id: createDoctorDto.spesialist },
    });
    
    if (!spesialist) {
      throw new HttpException('Spesialisasi tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const user = new User();
    user.name = createDoctorDto.name;
    user.email = createDoctorDto.email;
    user.salt = uuidv4();
    user.password = bcrypt.hashSync(createDoctorDto.password + user.salt, 10);
    user.photo_profile = createDoctorDto.photo_profile || null;
    user.status = 0;
    user.role = doctorRole;

    const savedUser = await queryRunner.manager.save(User, user);

    const doctor = new Doctor();
    doctor.user = savedUser;
    doctor.spesialist = spesialist;
    doctor.experience = createDoctorDto.experience;
    doctor.alumnus = createDoctorDto.alumnus;
    doctor.no_str = createDoctorDto.no_str;
    doctor.price = createDoctorDto.price;
    doctor.file_str = createDoctorDto.file_str || null;

    await queryRunner.manager.save(Doctor, doctor);
    await queryRunner.commitTransaction();

    return savedUser;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async updateDoctor(
  doctorId: string,
  updateDoctorDto: UpdateDoctorDto,
  file?: Express.Multer.File,
  fileStr?: Express.Multer.File
): Promise<Doctor> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const doctor = await queryRunner.manager.findOne(Doctor, {
      where: { id: doctorId },
      relations: ['user', 'spesialist'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const user = doctor.user;

    if (updateDoctorDto.name) {
      user.name = updateDoctorDto.name;
    }

    if (updateDoctorDto.email) {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: updateDoctorDto.email, id: Not(user.id) },
      });

      if (existingUser) {
        throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
      }
      user.email = updateDoctorDto.email;
    }

    if (file) {
      const oldPhotoPath = join(__dirname, '..', '..', 'uploads', 'doctors', user.photo_profile);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
      user.photo_profile = file.filename;
    }

    if (fileStr) {
      const oldFileStrPath = join(__dirname, '..', '..', 'uploads', 'doctors', 'files', doctor.file_str);
      if (fs.existsSync(oldFileStrPath)) {
        fs.unlinkSync(oldFileStrPath);
      }
      doctor.file_str = fileStr.filename;
    }

    await queryRunner.manager.save(User, user);

    if (updateDoctorDto.spesialist) {
      const spesialist = await queryRunner.manager.findOne(Spesialist, {
        where: { id: updateDoctorDto.spesialist },
      });

      if (!spesialist) {
        throw new HttpException('Spesialist not found', HttpStatus.NOT_FOUND);
      }
      doctor.spesialist = spesialist;
    }

    if (updateDoctorDto.experience) doctor.experience = updateDoctorDto.experience;
    if (updateDoctorDto.alumnus) doctor.alumnus = updateDoctorDto.alumnus;
    if (updateDoctorDto.no_str) doctor.no_str = updateDoctorDto.no_str;
    if (updateDoctorDto.price !== undefined) doctor.price = updateDoctorDto.price;

    const updatedDoctor = await queryRunner.manager.save(Doctor, doctor);
    await queryRunner.commitTransaction();

    return updatedDoctor;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async updateProfile(doctorId: string, updateDoctorDto: UpdateDoctorDto, file?: Express.Multer.File): Promise<Doctor> {
  const doctor = await this.doctorRepository.findOne({
    where: { id: doctorId },
    relations: ['user'],
  });

  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  if (file) {
    const oldPhotoPath = join(__dirname, '..', '..', 'uploads', 'doctors', doctor.user.photo_profile);
    if (doctor.user.photo_profile && fs.existsSync(oldPhotoPath)) {
      fs.unlinkSync(oldPhotoPath);
    }
    doctor.user.photo_profile = file.filename;
  }

  if (updateDoctorDto.name) {
    doctor.user.name = updateDoctorDto.name;
  }
  
  if (updateDoctorDto.experience) {
    doctor.experience = updateDoctorDto.experience;
  }

  await this.userRepository.save(doctor.user);
  return this.doctorRepository.save(doctor);
}
  
  
  //delete doctor
  async delete(doctorId: string): Promise<void> {
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    await this.doctorRepository.softDelete(doctorId);
  }


//restore doctor
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
        doctor.user.photo_profile = `${baseUrl}/uploads/doctors/${doctor.user.photo_profile}`;
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
  
  async getDoctorById(id: string) { 
    const doctor = await this.doctorRepository.createQueryBuilder('doctors')
      .leftJoinAndSelect('doctors.spesialist', 'spesialist')
      .leftJoin('doctors.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.photo_profile', 'user.status'])
      .where('doctors.id = :id', { id })
      .getOne();
  
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    if (doctor.user.photo_profile) {
      const baseUrl =  'http://localhost:8000';
      doctor.user.photo_profile = `${baseUrl}/uploads/doctors/${doctor.user.photo_profile}`;
    }


  
    return doctor;
  }
}
