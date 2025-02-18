import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/entities/patients.entity';
import { Role } from 'src/entities/roles.entity';
import { User } from 'src/entities/users.entity';
import { Repository, Brackets } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
    
        @InjectRepository(User)
        private userRepository: Repository<User>,
    
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
      ) {}
    
  async findAllPatient(
      page: number = 1, 
      limit: number = 10, 
      search?: string,
    ) {
      const queryBuilder = this.patientRepository.createQueryBuilder('patients')
        .leftJoin('patients.user', 'user')
        .addSelect(['user.id', 'user.name', 'user.photo_profile', 'user.email', 'user.status']);
    
      // Apply search by spesialist name or patient name
      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('user.name ILIKE :search', { search: `%${search}%` });
          }),
        );
      }
    
      // Apply pagination
      queryBuilder.skip((page - 1) * limit).take(limit);
    
      // Get data and total count
      const [patients, total] = await queryBuilder.getManyAndCount();
      
  
      // Transform photo_profile URLs
      const baseUrl = 'http://localhost:8000';
      const transformedPatiens = patients.map(patient => {
        // Transform patient's photo_profile if exists
        if (patient.user.photo_profile) {
          patient.user.photo_profile = `${baseUrl}/uploads/patients/${patient.user.photo_profile}`;
          if(!baseUrl){
            throw new Error('Base URL is not defined');
          }
        }
  
        return patient;
      });
    
      return {
        data: transformedPatiens,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    async updatePatientProfile(patientId: string, updatepatientDto: UpdatePatientDto, file?: Express.Multer.File): Promise<Patient> {
      try {
        const patient = await this.patientRepository.findOne({
          where: { id: patientId },
          relations: ['user'],
        });
    
        if (!patient) {
          throw new NotFoundException('patient not found');
        }
    
        // Handle file upload
        if (file) {
          try {
            // Hapus foto lama jika ada
            if (patient.user.photo_profile) {
              const oldPhotoPath = join(__dirname, '..', '..', 'uploads', 'patient', patient.user.photo_profile);
              if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
              }
            }
            patient.user.photo_profile = file.filename;
          } catch (error) {
            console.error('Error handling file:', error);
            throw new InternalServerErrorException('Error processing profile photo');
          }
        }
    
        // Update other fields
        if (updatepatientDto.name) {
          patient.user.name = updatepatientDto.name;
        }
    
        if (updatepatientDto.date_of_birth) {
          patient.date_of_birth = updatepatientDto.date_of_birth;
        }
    
        if (updatepatientDto.gender) {
          patient.gender = updatepatientDto.gender;
        }
    
        if (updatepatientDto.height !== undefined) {
          patient.height = updatepatientDto.height;
        }
    
        if (updatepatientDto.weight !== undefined) {
          patient.weight = updatepatientDto.weight;
        }
    
        // Save changes
        await this.userRepository.save(patient.user);
        return await this.patientRepository.save(patient);
      } catch (error) {
        console.error('Error in updatePatientProfile:', error);
        throw error;
      }
    }

    async getUserPatient(userId: string) { 
      const patient = await this.patientRepository.createQueryBuilder('patient')
        .leftJoin('patient.user', 'user')
        .addSelect(['user.id', 'user.name', 'user.email', 'user.photo_profile'])
        .where('user.id = :userId', { userId })
        .getOne();
    
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
    
      if (patient.user.photo_profile) {
        const baseUrl = 'http://localhost:8000';
        patient.user.photo_profile = `${baseUrl}/uploads/patient/${patient.user.photo_profile}`;
      }
    
      return patient;
    }

    async delete(id: string): Promise<void> {
        const patient = await this.patientRepository.findOne({ where: { id: id } });
        if (!patient) {
          throw new NotFoundException('patient not found');
        }
    
        await this.patientRepository.softDelete(id);
      }
    
    
    //restore patient
      async restore(id: string): Promise<void> {
        const deletedPatients = await this.patientRepository.findOne({
          where: { id: id },
          withDeleted: true,
        });
        if (!deletedPatients) {
          throw new NotFoundException('patient not found or not deleted');
        }
    
        await this.patientRepository.restore(id);
      }
    
      async findDeletedPatients(
        page: number = 1, 
        limit: number = 10, 
        search?: string,
      ): Promise<{ data: Patient[]; total: number; page: number; limit: number; totalPages: number }> {
        const queryBuilder = this.patientRepository.createQueryBuilder('patient')
          .where('patient.deleted_at IS NOT NULL')
          .withDeleted()
          .leftJoin('patient.user', 'user')
          .addSelect([ 'user.name', 'user.photo_profile', 'user.email' ])
      
        // Tambahkan kondisi pencarian jika `search` tidak kosong
        if (search) {
          queryBuilder.andWhere(
            new Brackets(qb => {
              qb.where('user.name LIKE :search', { search: `%${search}%` })
            })
          );
        }
    
    
        // Hitung total data
        const [patients, total] = await queryBuilder.getManyAndCount();
    
        const baseUrl = 'http://localhost:8000';
        const transformedPatiens = patients.map(patient => {
          // Transform patient's photo_profile if exists
          if (patient.user.photo_profile) {
            patient.user.photo_profile = `${baseUrl}/uploads/patients/${patient.user.photo_profile}`;
            if(!baseUrl){
              throw new Error('Base URL is not defined');
            }
          }
    
          return patient;
        });

        queryBuilder.skip((page - 1) * limit).take(limit);
      
      
        return { 
          data: transformedPatiens,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),};
      }
}
