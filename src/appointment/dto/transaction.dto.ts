import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  appointmentId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}