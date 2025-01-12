import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/entities/patients.entity';
import { Role } from 'src/entities/roles.entity';
import { User } from 'src/entities/users.entity';
import { Repository, Brackets } from 'typeorm';

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
    
      // Apply search by spesialist name or doctor name
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

    async delete(id: string): Promise<void> {
        const patient = await this.patientRepository.findOne({ where: { id: id } });
        if (!patient) {
          throw new NotFoundException('Doctor not found');
        }
    
        await this.patientRepository.softDelete(id);
      }
    
    
    //restore doctor
      async restore(id: string): Promise<void> {
        const deletedPatients = await this.patientRepository.findOne({
          where: { id: id },
          withDeleted: true,
        });
        if (!deletedPatients) {
          throw new NotFoundException('Doctor not found or not deleted');
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
