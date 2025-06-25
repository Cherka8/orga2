import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { Group } from './entities/group.entity';
import { GroupMember } from '../group-member/entities/group-member.entity';
import { Actor } from '../actor/entities/actor.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, Actor]), AuthModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: []
})
export class GroupModule {}
