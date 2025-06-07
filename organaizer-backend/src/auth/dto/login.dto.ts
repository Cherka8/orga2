import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: "L'email ne doit pas être vide." })
  @IsEmail({}, { message: "L'email doit être une adresse email valide." })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe ne doit pas être vide.' })
  @IsString()
  // On peut omettre MinLength ici si on ne veut pas donner d'indice sur la longueur lors du login,
  // mais c'est cohérent avec le DTO d'inscription.
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password: string;
}
