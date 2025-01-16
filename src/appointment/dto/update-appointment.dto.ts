import { IsOptional, IsEnum, IsDateString, IsBoolean, IsString, IsUrl } from 'class-validator';
import { AppointmentStatus } from 'src/entities/appoinments.entity';

export class UpdateAppointmentStatusDto {
    @IsEnum(['approve', 'reject', ])
    action: 'approve' | 'reject';
  
    @IsString()
    @IsOptional()
    rejectionReason?: string;

    @IsDateString()
    @IsOptional()
    reschedule?: Date;

    status : string;
  }

  
  
  export class SetMeetingLinkDto {
    @IsString()
    meetingLink: string;
  }

  
