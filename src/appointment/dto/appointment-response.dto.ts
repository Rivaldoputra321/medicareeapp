import { IsEnum, IsString, IsOptional } from 'class-validator';

export class AppointmentResponseDto {
  @IsEnum(['approve', 'reject', 'request_reschedule'])
  action: 'approve' | 'reject' | 'request_reschedule';

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}