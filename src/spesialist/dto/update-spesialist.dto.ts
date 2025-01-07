import { PartialType } from '@nestjs/mapped-types';
import { CreateSpesialistDto } from './create-spesialist.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSpesialistDto extends PartialType(CreateSpesialistDto) {
    @IsString()
    @IsOptional()
    name:  string;

}
