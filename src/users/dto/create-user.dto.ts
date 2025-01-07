import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator"
import { genders } from "src/entities/patients.entity";
import { IsNull } from "typeorm";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNotEmpty()
  password: string;

  // Patient-specific fields
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date_of_birth: Date;

  @IsNotEmpty()
  @IsEnum(genders)
  gender: genders;

  @IsNotEmpty()
  @IsString()
  telp: string;


}
