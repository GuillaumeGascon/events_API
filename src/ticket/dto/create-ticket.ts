import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTicketDto {
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsString()
  @IsNotEmpty()
  barecode: string;

  @IsBoolean()
  @IsNotEmpty()
  valid: boolean;
}