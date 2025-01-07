import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpesialistDto } from './dto/create-spesialist.dto';
import { UpdateSpesialistDto } from './dto/update-spesialist.dto';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Spesialist } from 'src/entities/spesialists.entity';
import { Doctor } from 'src/entities/doctors.entity';
import { User } from 'src/entities/users.entity';

@Injectable()
export class SpesialistService {
  constructor(
    @InjectRepository(Spesialist)
    private spesialistRepository: Repository<Spesialist>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    // Get total count for pagination metadata
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findAllWithoutPagination(){
    try {
      const spesialist = await this.spesialistRepository.find();
      return spesialist; 
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
        doctor.user.photo_profile = `${baseUrl}/uploads/${doctor.user.photo_profile}`;
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
    return spesialist;
  }

  async update(id: string, updateSpesialistDto: UpdateSpesialistDto) {
    const existingSpesialist = await this.spesialistRepository.findOne({
      where: { name: updateSpesialistDto.name },
    });
    if (existingSpesialist) {
      throw new ConflictException('Spesialis dengan nama ini sudah ada');
    }
    await this.spesialistRepository.update(id, updateSpesialistDto);
    return this.findOne(id);
  }

  

  async remove(id: string) {
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
}
