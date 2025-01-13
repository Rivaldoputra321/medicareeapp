import { IsString, IsOptional } from 'class-validator';

export class MidtransNotificationDto {
  @IsString()
  transaction_status: string;

  @IsString()
  order_id: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  status_message?: string;
}