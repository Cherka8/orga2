import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedCalendarAccessToken } from './entities/shared-calendar-access-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SharedCalendarAccessToken])],
  controllers: [],
  providers: [],
  exports: []
})
export class SharedCalendarAccessTokenModule {}
