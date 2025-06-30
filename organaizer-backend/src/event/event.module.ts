import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventParticipant } from '../event-participant/entities/event-participant.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { AuthModule } from '../auth/auth.module';
import { Actor } from '../actor/entities/actor.entity';
import { Group } from '../group/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventParticipant, Actor, Group]),
    AuthModule, // Importé pour que le JwtAuthGuard soit disponible
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService], // <-- Ajout de cette ligne
})
export class EventModule {}

