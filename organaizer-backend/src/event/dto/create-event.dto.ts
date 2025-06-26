import { IsNotEmpty, IsString, IsDateString, IsOptional, IsISO8601, IsHexColor } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsOptional()
  start?: string;

  @IsDateString()
  @IsOptional()
  @IsISO8601()
  end?: string;

  @IsOptional()
  @IsHexColor()
  event_color?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
