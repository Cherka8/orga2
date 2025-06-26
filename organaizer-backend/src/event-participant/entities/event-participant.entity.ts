import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Actor } from '../../actor/entities/actor.entity';
import { Group } from '../../group/entities/group.entity';

export enum ParticipationStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative',
  NEEDS_ACTION = 'needsAction',
}

@Entity('event_participants')
@Check(`("actor_id" IS NOT NULL AND "group_id" IS NULL) OR ("actor_id" IS NULL AND "group_id" IS NOT NULL)`)
export class EventParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id', type: 'int' })
  eventId: number;

  @Column({ name: 'actor_id', type: 'int', nullable: true })
  actorId: number;

  @Column({ name: 'group_id', type: 'int', nullable: true })
  groupId: number;

  @ManyToOne(() => Event, (event) => event.participants, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Actor, (actor) => actor.eventParticipations, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;

  @ManyToOne(() => Group, { // Relation unidirectionnelle pour l'instant
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({
    type: 'enum',
    enum: ParticipationStatus,
    default: ParticipationStatus.NEEDS_ACTION,
    name: 'participation_status',
  })
  participationStatus: ParticipationStatus;

  @CreateDateColumn({ name: 'added_at', type: 'timestamp' })
  addedAt: Date;
}
