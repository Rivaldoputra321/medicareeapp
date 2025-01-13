import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEmail, IsDate, IsEnum, IsNumber, IsNumberString } from "class-validator";
import { genders } from "src/entities/patients.entity";

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  file_str: string;
  
  photo_profile: string;

  // Patient-specific fields
  @IsNotEmpty()
  @IsString()
  spesialist: string;

  @IsNotEmpty()
  @IsString()
  alumnus: string;

  @IsNotEmpty()

  experience: number;

  
  @IsNotEmpty()
  @IsNumberString()
  no_str: string;


  @IsNotEmpty()
  price: number;

}
