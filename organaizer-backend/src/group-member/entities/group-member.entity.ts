import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from '../../group/entities/group.entity';
import { Actor } from '../../actor/entities/actor.entity';

@Entity('group_members')
export class GroupMember {
  @PrimaryColumn({ name: 'group_id', type: 'int' })
  groupId: number;

  @PrimaryColumn({ name: 'actor_id', type: 'int' })
  actorId: number;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Actor, (actor) => actor.groupMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;

  @CreateDateColumn({ name: 'added_at', type: 'timestamp' })
  addedAt: Date;
}
