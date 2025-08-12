import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { PreferencesModule } from './preferences/preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/organaizer_preferences'),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DB || 'organaizer',
      entities: [Account, Company, Actor, Event, EventParticipant, Group, GroupMember, SharedCalendarAccessToken],
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      // autoLoadEntities: true,
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
    PreferencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
