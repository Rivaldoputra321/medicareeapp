import { IsString } from "class-validator";

export class CreateSpesialistDto {
    @IsString()
    name:  string;

}
