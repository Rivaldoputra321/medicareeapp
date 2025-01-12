import { IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  spesialist?: string;

  @IsOptional()

  experience?: number;

  @IsOptional()
  @IsString()
  alumnus?: string;

  @IsOptional()
  @IsString()
  no_str?: string;

  @IsOptional()
  price?: number;
}
