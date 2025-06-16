import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationEmailDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse e-mail valide.' })
  @IsNotEmpty({ message: 'L\'adresse e-mail ne doit pas être vide.' })
  email: string;
}
