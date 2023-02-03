import { IsDateString, IsOptional, IsString } from "class-validator";

export class EditEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  creator?: string;
  
  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  banner?: string;
}