import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class RegisterIndividualDto {
  @IsNotEmpty({ message: 'L\'email ne doit pas être vide.' })
  @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe ne doit pas être vide.' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password: string;

  @IsNotEmpty({ message: 'Le prénom ne doit pas être vide.' })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @IsNotEmpty({ message: 'Le nom de famille ne doit pas être vide.' })
  @IsString()
  @MaxLength(255)
  lastName: string;

  @IsNotEmpty({ message: 'Le pays ne doit pas être vide.' })
  @IsString()
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'L\'adresse ne doit pas dépasser 255 caractères.' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'La ville ne doit pas dépasser 100 caractères.' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Le code postal doit être une chaîne de caractères.' })
  @MaxLength(20, { message: 'Le code postal ne doit pas dépasser 20 caractères.' })
  postalCode?: string;

  @IsNotEmpty({ message: 'La date de naissance ne doit pas être vide.' })
  @IsDateString({}, { message: 'La date de naissance doit être une date valide.' })
  birthDate: Date;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  occupation?: string;
}
