import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUrl,
  IsEmail,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { ActorType } from '../entities/actor.entity';

export class CreateActorDto {
  @IsEnum(ActorType)
  @IsNotEmpty()
  type: ActorType;

  @IsUrl()
  @IsOptional()
  @MaxLength(2048)
  photoUrl?: string;

  // Human-specific fields
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === ActorType.HUMAN)
  @MaxLength(255)
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === ActorType.HUMAN)
  @MaxLength(255)
  lastName?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === ActorType.HUMAN)
  @MaxLength(255)
  role?: string;

  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => o.type === ActorType.HUMAN)
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === ActorType.HUMAN)
  @MaxLength(50)
  phone?: string;

  // Location-specific fields
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === ActorType.LOCATION)
  @MaxLength(255)
  locationName?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === ActorType.LOCATION)
  address?: string;
}
