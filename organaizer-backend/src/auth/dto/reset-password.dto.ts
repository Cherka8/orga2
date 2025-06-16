import { IsNotEmpty, MinLength, Matches, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Le token ne peut pas être vide.' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide.' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  // Optionnel : ajouter une regex pour la complexité du mot de passe
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.'})
  password: string;

  @IsNotEmpty({ message: 'La confirmation du mot de passe ne peut pas être vide.' })
  confirmPassword: string;
}
