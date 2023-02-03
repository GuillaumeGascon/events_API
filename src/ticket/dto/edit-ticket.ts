import { IsBoolean, IsOptional, IsString } from "class-validator";

export class EditTicketDto {
  @IsString()
  @IsOptional()
  barecode?: string;

  @IsBoolean()
  @IsOptional()
  valid?: boolean;
}