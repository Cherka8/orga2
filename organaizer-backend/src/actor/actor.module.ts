import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './entities/actor.entity';
import { EventParticipant } from '../event-participant/entities/event-participant.entity';
import { ActorController } from './actor.controller';
import { ActorService } from './actor.service';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Actor, EventParticipant]),
    AuthModule, // Add AuthModule to imports
  ],
  controllers: [ActorController],
  providers: [ActorService],
  exports: [ActorService], // Export ActorService if other modules need it
})
export class ActorModule {}

