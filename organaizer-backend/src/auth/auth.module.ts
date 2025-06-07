import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importer ConfigModule et ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Company } from '../company/entities/company.entity'; // Importer Company
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'; // Importer JwtStrategy

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      // Si vous utilisez @nestjs/config, vous injecteriez ConfigService ici
      // imports: [ConfigModule], // Exemple si ConfigModule est global ou importé ici
      // useFactory: async (configService: ConfigService) => ({
      //   secret: configService.get<string>('JWT_SECRET'),
      //   signOptions: {
      //     expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s',
      //   },
      // }),
      // inject: [ConfigService],
      imports: [ConfigModule], // S'assurer que ConfigModule est disponible ici
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService], // Injecter ConfigService
    }),
    TypeOrmModule.forFeature([Account, Company]),
  ], // Ajouter Company ici
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Ajouter JwtStrategy ici
  exports: [AuthService]
})
export class AuthModule {}
