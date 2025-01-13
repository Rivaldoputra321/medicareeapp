import { IsOptional, IsEnum, IsDateString, IsBoolean, IsString, IsUrl } from 'class-validator';
import { AppointmentStatus } from 'src/entities/appoinments.entity';

export class UpdateAppointmentStatusDto {
    @IsEnum(['approve', 'reject', 'reschedule'])
    action: 'approve' | 'reject' | 'reschedule';
  
    @IsString()
    @IsOptional()
    rejectionReason?: string;
  }
  
  export class SetMeetingLinkDto {
    @IsString()
    meetingLink: string;
  }