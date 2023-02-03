import { IsNotEmpty, IsString } from "class-validator";

export class CreateCatDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  file: Buffer;
}