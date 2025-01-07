import { IsEmail, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from "class-validator"
import { genders } from "src/entities/patients.entity";

export class patientDto {
    @IsNotEmpty({ message: 'Name is required' })
    date_of_birth: Date;
  
    @IsEnum(genders)
    @IsNotEmpty({ message: 'Gender is required' })
    gender: genders;
  
    @IsNumberString()
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    @IsNotEmpty({ message: 'Password is required' })
    telp: string;
  
    @IsString()
    address: string;
  }
