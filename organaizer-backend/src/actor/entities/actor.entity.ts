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
import { EventParticipant } from '../../event-participant/entities/event-participant.entity';
import { GroupMember } from '../../group-member/entities/group-member.entity';
import { SharedCalendarAccessToken } from '../../shared-calendar-access-token/entities/shared-calendar-access-token.entity';

export enum ActorType {
  HUMAN = 'human',
  LOCATION = 'location',
}

@Entity('actors')
export class Actor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.actors, { nullable: false })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({
    type: 'enum',
    enum: ActorType,
    nullable: false,
  })
  type: ActorType;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'photo_url' })
  photoUrl: string;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'color_representation' })
  colorRepresentation: string;

  // Human-specific fields
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Email for human actor
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true }) // Phone for human actor
  phone: string;

  // Location-specific fields
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'location_name' })
  locationName: string;

  @Column({ type: 'text', nullable: true }) // Address for location actor
  address: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => EventParticipant, (eventParticipant) => eventParticipant.actor)
  eventParticipations: EventParticipant[];

  @OneToMany(() => GroupMember, (groupMember) => groupMember.actor)
  groupMemberships: GroupMember[];

  @OneToMany(() => SharedCalendarAccessToken, (token) => token.actorContext)
  sharedCalendarAccessTokens: SharedCalendarAccessToken[];

  // TODO: Ajouter les relations avec Event (presenter, location) si elles ne sont pas déjà gérées par EventParticipant
}
