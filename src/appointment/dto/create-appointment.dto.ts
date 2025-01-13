import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { AppointmentStatus } from 'src/entities/appoinments.entity';

export class CreateAppointmentDto {
    @IsUUID()
    doctorId: string;
  
    @IsDateString()
    schedule: Date;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    total_price?: number;
}