import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedCalendarAccessToken } from './entities/shared-calendar-access-token.entity';
import { SharedCalendarAccessTokenController } from './shared-calendar-access-token.controller';
import { SharedCalendarAccessTokenService } from './shared-calendar-access-token.service';
import { ActorModule } from '../actor/actor.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedCalendarAccessToken]),
    ActorModule,
    EventModule
  ],
  controllers: [SharedCalendarAccessTokenController],
  providers: [SharedCalendarAccessTokenService],
  exports: [SharedCalendarAccessTokenService]
})
export class SharedCalendarAccessTokenModule {}
