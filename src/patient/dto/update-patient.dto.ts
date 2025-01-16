import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { Type } from 'class-transformer';
import { IsString, IsDate, IsEnum } from 'class-validator';
import { genders } from 'src/entities/patients.entity';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsString()
  name: string;

  // Patient-specific fields
  @Type(() => Date)
  @IsDate()
  date_of_birth: Date;

  @IsEnum(genders)
  gender: genders;

  photo_profile? : string;
}
