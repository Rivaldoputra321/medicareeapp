import { IsOptional, IsEnum, IsDateString, IsBoolean, IsString, IsUrl } from 'class-validator';
import { AppointmentStatus } from 'src/entities/appoinments.entity';

export class UpdateAppointmentStatusDto {
    @IsEnum(['approve', 'reject', ])
    action: 'approve' | 'reject';
  
    @IsString()
    @IsOptional()
    rejectionReason?: string;



    status : string;
  }

  

  export class RescheduleDto {
    @IsDateString()
    @IsOptional()
    reschedule?: Date;
  }
  
  export class SetMeetingLinkDto {
    @IsString()
    meetingLink: string;
  }

  
  export class completeDto {
    @IsString()
    note: string;

    @IsString()
    diagnosis: string;
  }
  
  
