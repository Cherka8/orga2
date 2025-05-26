import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Actor } from '../../actor/entities/actor.entity';

export enum ParticipationStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative',
  NEEDS_ACTION = 'needsAction',
}

@Entity('event_participants')
export class EventParticipant {
  @PrimaryColumn({ name: 'event_id', type: 'int' })
  eventId: number;

  @PrimaryColumn({ name: 'actor_id', type: 'int' })
  actorId: number;

  @ManyToOne(() => Event, (event) => event.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Actor, (actor) => actor.eventParticipations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;

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
