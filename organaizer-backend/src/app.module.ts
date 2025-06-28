import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importer ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './auth/entities/account.entity';
import { Company } from './company/entities/company.entity';
import { Actor } from './actor/entities/actor.entity';
import { Event } from './event/entities/event.entity';
import { EventParticipant } from './event-participant/entities/event-participant.entity';
import { Group } from './group/entities/group.entity';
import { GroupMember } from './group-member/entities/group-member.entity';
import { SharedCalendarAccessToken } from './shared-calendar-access-token/entities/shared-calendar-access-token.entity';
import { ActorModule } from './actor/actor.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { EventModule } from './event/event.module';
import { EventParticipantModule } from './event-participant/event-participant.module';
import { GroupModule } from './group/group.module';
import { GroupMemberModule } from './group-member/group-member.module';
import { SharedCalendarAccessTokenModule } from './shared-calendar-access-token/shared-calendar-access-token.module';
import { ColorModule } from './color/color.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Configurer ConfigModule
      isGlobal: true, // Rend ConfigModule disponible globalement
      envFilePath: '.env', // Spécifie le chemin du fichier .env
    }),
    TypeOrmModule.forRoot({
      type: 'mysql', // Type de base de données
      host: 'localhost', // Votre hôte
      port: 3306, // Votre port
      username: 'root', // Votre nom d'utilisateur
      password: '', // Votre mot de passe (laissé vide ici)
      database: 'organaizer', // Le nom de votre base de données
      entities: [Account, Company, Actor, Event, EventParticipant, Group, GroupMember, SharedCalendarAccessToken], // Nous ajouterons nos entités (modèles de table) ici plus tard
      synchronize: true, // IMPORTANT: true pour le développement, false pour la production (utiliser les migrations)
      // autoLoadEntities: true, // Alternative à 'entities', peut être pratique
    }),
    ActorModule,
    AuthModule,
    CompanyModule,
    EventModule,
    EventParticipantModule,
    GroupModule,
    GroupMemberModule,
    SharedCalendarAccessTokenModule,
    ColorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
