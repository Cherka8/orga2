import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class QueryHoursDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  actorIds?: number[];

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
