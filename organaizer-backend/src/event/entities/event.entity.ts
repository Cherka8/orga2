import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Account } from '../../auth/entities/account.entity';
import { Actor } from '../../actor/entities/actor.entity';
import { EventParticipant } from '../../event-participant/entities/event-participant.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number; // Schema: UUID / INT AUTO_INCREMENT. Using INT for now.

  @ManyToOne(() => Account, (account) => account.events, { nullable: false })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'timestamp',
    name: 'start_time',
    nullable: false,
    precision: 6, // Ajout pour cohérence
    default: '2000-01-01 00:00:00', // Valeur par défaut fictive
  })
  startTime: Date;

  @Column({
    type: 'timestamp',
    name: 'end_time',
    nullable: false,
    precision: 6, // Ajout pour cohérence
    default: '2000-01-01 00:00:00', // Valeur par défaut fictive
  })
  endTime: Date;

  @Column({ name: 'is_all_day', type: 'boolean', default: false })
  isAllDay: boolean;

  @ManyToOne(() => Actor, { nullable: true })
  @JoinColumn({ name: 'location_actor_id' })
  locationActor: Actor; // Actor of type 'location'

  @ManyToOne(() => Actor, { nullable: true })
  @JoinColumn({ name: 'presenter_actor_id' })
  presenterActor: Actor; // Actor of type 'human'

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'event_color' })
  eventColor: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => EventParticipant, (eventParticipant) => eventParticipant.event)
  participants: EventParticipant[];
}
