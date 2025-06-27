import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsISO8601, IsHexColor, ValidateIf } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  start: string;

  @IsDateString()
  @IsNotEmpty()
  end: string;

  @IsOptional()
  @IsHexColor()
  event_color?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  location_actor_id?: number | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  presenter_actor_id?: number | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  participant_ids?: number[];
}
