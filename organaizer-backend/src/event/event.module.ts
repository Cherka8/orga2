import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    AuthModule, // Importé pour que le JwtAuthGuard soit disponible
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

