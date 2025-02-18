import { IsEnum, IsString, IsOptional } from 'class-validator';

export class AppointmentResponseDto {
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject' ;

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}