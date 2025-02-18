import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpesialistDto } from './dto/create-spesialist.dto';
import { UpdateSpesialistDto } from './dto/update-spesialist.dto';
import { Brackets, DataSource, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Spesialist } from 'src/entities/spesialists.entity';
import { Doctor } from 'src/entities/doctors.entity';
import { User } from 'src/entities/users.entity';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class SpesialistService {
  constructor(
    @InjectRepository(Spesialist)
    private spesialistRepository: Repository<Spesialist>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
      private readonly dataSource: DataSource
  ) {}

  async create(createSpesialistDto: CreateSpesialistDto) {
    const existingSpesialist = await this.spesialistRepository.findOne({
      where: { name: createSpesialistDto.name },
    });

    if (existingSpesialist) {
      throw new ConflictException('Spesialis dengan nama ini sudah ada');
    }

    const spesialist = this.spesialistRepository.create(createSpesialistDto);
    return this.spesialistRepository.save(spesialist);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.spesialistRepository.createQueryBuilder('spesialists');

    // Apply search if the search parameter is provided
    if (search) {
      queryBuilder.where('spesialists.name ILIKE :search', { search: `%${search}%` });
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const baseUrl = 'http://localhost:8000';
    const transformedSpesialists = data.map(data => {
      // Transform doctor's photo_profile if exists
      if (data.gambar) {
        data.gambar = `${baseUrl}/uploads/spesialis/${data.gambar}`;
        if(!baseUrl){
          throw new Error('Base URL is not defined');
        }
      }

      return data;
    });

    return {
      data: transformedSpesialists,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findAllWithoutPagination() {
    try {
      const spesialist = await this.spesialistRepository.find();
  
      const baseUrl = 'http://localhost:8000';
      if (!baseUrl) {
        throw new Error('Base URL is not defined');
      }
  
      const transformedSpesialists = spesialist.map(item => {
        // Transform doctor's `gambar` if it exists
        if (item.gambar) {
          item.gambar = `${baseUrl}/uploads/spesialis/${item.gambar}`;
        }
        return item;
      });
  
      return transformedSpesialists;
    } catch (error) {
      throw new Error(`Failed to fetch specialists: ${error.message}`);
    }
  }
  

  async searchDoctorSpesialist(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    spesialistId?: string
  ) {
    const queryBuilder = this.doctorRepository.createQueryBuilder('doctors')
      .leftJoinAndSelect('doctors.spesialist', 'spesialist')
      .leftJoin('doctors.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.photo_profile', 'user.email', 'user.status']);
  
    // Apply search by spesialist name or doctor name
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('spesialist.name ILIKE :search', { search: `%${search}%` })
            .orWhere('user.name ILIKE :search', { search: `%${search}%` });
        }),
      );
    }
  
    // Apply filter by spesialistId if provided
    if (spesialistId) {
      queryBuilder.andWhere('spesialist.id = :spesialistId', { spesialistId });
    }
  
    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);
  
    // Get data and total count
    const [doctors, total] = await queryBuilder.getManyAndCount();

    // Transform photo_profile URLs
    const baseUrl = 'http://localhost:8000';
    const transformedDoctors = doctors.map(doctor => {
      // Transform doctor's photo_profile if exists
      if (doctor.user.photo_profile) {
        doctor.user.photo_profile = `${baseUrl}/uploads/doctors/${doctor.user.photo_profile}`;
        if(!baseUrl){
          throw new Error('Base URL is not defined');
        }
      }

      if (doctor.file_str) {
        doctor.file_str = `${baseUrl}/uploads/doctors/files/${doctor.file_str}`;
        if(!baseUrl){
          throw new Error('Base URL is not defined');
        }
      }

      return doctor;
    });
  
    return {
      data: transformedDoctors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  


  async findOne(id: string) {
    const spesialist = await this.spesialistRepository.findOne({ where: { id } });
    
    if (!spesialist) {
      throw new NotFoundException(`Spesialist with ID ${id} not found`);
    }
  
    const baseUrl = 'http://localhost:8000';
    if (!baseUrl) {
      throw new Error('Base URL is not defined');
    }
  
    // Transform the doctor's `gambar` if it exists
    if (spesialist.gambar) {
      spesialist.gambar = `${baseUrl}/uploads/spesialis/${spesialist.gambar}`;
    }
  
    return spesialist;
  }
  
  async updateSpesialist(
    spesialistId: string,
    updateSpesialistDto: UpdateSpesialistDto,
    file?: Express.Multer.File
  ): Promise<Spesialist> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Temukan spesialis berdasarkan ID
      const spesialist = await queryRunner.manager.findOne(Spesialist, {
        where: { id: spesialistId },
      });
  
      if (!spesialist) {
        throw new NotFoundException('Spesialis tidak ditemukan');
      }
  
      // Update nama jika ada
      if (updateSpesialistDto.name) {
        const existingSpesialist = await queryRunner.manager.findOne(Spesialist, {
          where: { name: updateSpesialistDto.name, id: Not(spesialist.id) },
        });
  
        if (existingSpesialist) {
          throw new HttpException('Nama spesialis sudah digunakan', HttpStatus.CONFLICT);
        }
        spesialist.name = updateSpesialistDto.name;
      }
  
      // Update gambar jika ada file baru
      if (file) {
        const oldImagePath = join(__dirname, '..', '..', 'uploads', 'spesialists', spesialist.gambar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Hapus gambar lama jika ada
        }
        spesialist.gambar = file.filename; // Simpan nama file baru
      }
  
      // Simpan perubahan spesialis
      const updatedSpesialist = await queryRunner.manager.save(Spesialist, spesialist);
  
      // Commit transaksi
      await queryRunner.commitTransaction();
  
      return updatedSpesialist;
    } catch (error) {
      // Rollback transaksi jika ada error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
  
  

  

  async delete(id: string) {
    const spesialist = await this.findOne(id);
    if (!spesialist) {
      throw new NotFoundException(`Spesialist with ID ${id} not found`);
    }
    await this.spesialistRepository.softDelete(id);
    return { message: `Spesialist with ID ${id} has been soft deleted` };
  }

  async restore(id: string) {
    const restoreResult = await this.spesialistRepository.restore(id);
    if (restoreResult.affected === 0) {
      throw new NotFoundException(`Spesialist with ID ${id} not found or not soft deleted`);
    }
    return { message: `Spesialist with ID ${id} has been restored` };
  }

  async getDeletedSpesialis(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const queryBuilder = this.spesialistRepository
      .createQueryBuilder('spesialists')
      .withDeleted() // Include soft-deleted records
      .where('spesialists.deleted_at IS NOT NULL'); // Filter only soft-deleted records
  
    // Apply search if provided
    if (search) {
      queryBuilder.andWhere('spesialists.name ILIKE :search', {
        search: `%${search}%`,
      });
    }
  
    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);
  
    const [data, total] = await queryBuilder.getManyAndCount();
  
    const baseUrl = 'http://localhost:8000';
    const transformedSpesialists = data.map((data) => {
      if (data.gambar) {
        data.gambar = `${baseUrl}/uploads/spesialis/${data.gambar}`;
      }
      return data;
    });
  
    return {
      data: transformedSpesialists,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  
}
