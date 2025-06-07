import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventParticipant } from './entities/event-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventParticipant])],
  controllers: [],
  providers: [],
  exports: []
})
export class EventParticipantModule {}
