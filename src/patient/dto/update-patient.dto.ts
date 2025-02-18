import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { Transform, Type } from 'class-transformer';
import { IsString, IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { genders } from 'src/entities/patients.entity';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsString()
  @IsOptional()
  name?: string;

  // Patient-specific fields
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_of_birth?: Date;

  @IsOptional()
  @IsEnum(genders)
  gender?: genders;
  
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber()
  height?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber()
  weight?: number;

  photo_profile? : string;
}
