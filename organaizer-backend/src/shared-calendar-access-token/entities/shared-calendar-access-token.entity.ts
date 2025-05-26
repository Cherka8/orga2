import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../auth/entities/account.entity';
import { Actor } from '../../actor/entities/actor.entity';
import { Group } from '../../group/entities/group.entity';

@Entity('shared_calendar_access_tokens')
export class SharedCalendarAccessToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_id', type: 'int' })
  accountId: number;

  @ManyToOne(() => Account, (account) => account.sharedCalendarAccessTokens)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'actor_id_context', type: 'int', nullable: true })
  actorIdContext: number;

  @ManyToOne(() => Actor, (actor) => actor.sharedCalendarAccessTokens, { nullable: true })
  @JoinColumn({ name: 'actor_id_context' })
  actorContext: Actor;

  @Column({ name: 'group_id_context', type: 'int', nullable: true })
  groupIdContext: number;

  @ManyToOne(() => Group, (group) => group.sharedCalendarAccessTokens, { nullable: true })
  @JoinColumn({ name: 'group_id_context' })
  groupContext: Group;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'json' })
  permissions: any; // Store as JSON, e.g., { view_only: true } or ['read', 'write_events']

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date;
}
