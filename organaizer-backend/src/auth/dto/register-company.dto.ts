import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, MaxLength, ValidateNested, IsNotEmptyObject } from 'class-validator';
import { Type } from 'class-transformer';

class CompanyInformationDto {
  @IsNotEmpty({ message: 'Le nom de l\'entreprise ne doit pas être vide.' })
  @IsString()
  @MaxLength(255)
  companyName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  industry?: string;

  @IsNotEmpty({ message: 'Le téléphone de l\'entreprise ne doit pas être vide.' })
  @IsString()
  @MaxLength(50)
  companyPhone: string;

  @IsNotEmpty({ message: 'L\'adresse de l\'entreprise ne doit pas être vide.' })
  @IsString()
  companyAddress: string;

  @IsNotEmpty({ message: 'La ville de l\'entreprise ne doit pas être vide.' })
  @IsString()
  @MaxLength(100)
  companyCity: string;

  @IsNotEmpty({ message: 'Le code postal de l\'entreprise ne doit pas être vide.' })
  @IsString()
  @MaxLength(20)
  companyPostalCode: string;

  @IsNotEmpty({ message: 'Le pays de l\'entreprise ne doit pas être vide.' })
  @IsString()
  @MaxLength(100)
  companyCountry: string;

  @IsOptional()
  @IsString()
  @MaxLength(50) // Adjust MaxLength as needed
  vatNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50) // Adjust MaxLength as needed
  siretNumber?: string;
}

class PrimaryContactDetailsDto {
  @IsNotEmpty({ message: 'Le prénom du contact ne doit pas être vide.' })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @IsNotEmpty({ message: 'Le nom de famille du contact ne doit pas être vide.' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPosition?: string;

  @IsNotEmpty({ message: 'L\'email (professionnel) ne doit pas être vide.' })
  @IsEmail({}, { message: 'L\'email doit être une adresse email valide.' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe ne doit pas être vide.' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password: string;
}

export class RegisterCompanyDto {
  @IsNotEmptyObject({}, { message: "Les informations de l'entreprise ne doivent pas être vides." })
  @ValidateNested()
  @Type(() => CompanyInformationDto)
  companyInformation: CompanyInformationDto;

  @IsNotEmptyObject({}, { message: "Les informations du contact principal ne doivent pas être vides." })
  @ValidateNested()
  @Type(() => PrimaryContactDetailsDto)
  primaryContact: PrimaryContactDetailsDto;
}
