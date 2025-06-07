import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Importer ConfigService
// import { AuthService } from './auth.service'; // Optionnel, si on veut valider plus que le payload
// import { Account } from './entities/account.entity'; // Pour typer l'utilisateur retourné

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      // Il est crucial d'avoir une clé secrète. Si elle n'est pas définie,
      // l'application ne peut pas fonctionner de manière sécurisée.
      throw new Error('La variable d\'environnement JWT_SECRET n\'est pas définie.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // 'secret' est maintenant garanti d'être une string
    });
  }

  // Cette méthode est appelée par Passport APRÈS que le token a été vérifié (signature et expiration)
  // Le payload décodé du token est passé en argument.
  async validate(payload: { sub: string; email: string }): Promise<{ id: number; email: string }> {
    // À ce stade, le token est valide. Le payload contient les informations que nous y avons mises lors du login.
    // Nous pourrions ici effectuer une vérification supplémentaire en base de données si nécessaire
    // (par exemple, vérifier si l'utilisateur existe toujours ou n'a pas été banni).
    // Pour cet exemple, nous faisons confiance au payload du token validé.

    // const user = await this.authService.validateUserById(payload.sub); // Exemple si on veut valider en BDD
    // if (!user) {
    //   throw new UnauthorizedException('Utilisateur non trouvé ou token invalide.');
    // }

    // Ce qui est retourné ici sera attaché à request.user
    // Il contient l'ID de l'utilisateur (provenant de 'sub' dans le payload JWT) et son email.
    // payload.sub est généralement une string dans le token JWT, même si l'ID original est un nombre.
    return { id: parseInt(payload.sub, 10), email: payload.email };
  }
}
