import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Actor } from '../../actor/entities/actor.entity';
import { Event } from '../../event/entities/event.entity';
import { Company } from '../../company/entities/company.entity';
import { Group } from '../../group/entities/group.entity';
import { SharedCalendarAccessToken } from '../../shared-calendar-access-token/entities/shared-calendar-access-token.entity';

export enum AccountType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    nullable: false,
    name: 'account_type',
  })
  accountType: AccountType;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  country: string;

  @Column({ type: 'date', nullable: true, name: 'birth_date' })
  birthDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'contact_position' })
  contactPosition: string;

  @Column({ type: 'json', nullable: true, name: 'view_preferences' })
  viewPreferences: any;

  @Column({ type: 'boolean', default: true, nullable: false, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpires: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true, name: 'reset_password_token' })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reset_password_token_expires' })
  resetPasswordTokenExpires: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Actor, (actor) => actor.account)
  actors: Actor[];

  @OneToMany(() => Event, (event) => event.account)
  events: Event[];

  @OneToMany(() => Group, (group) => group.account)
  groups: Group[];

  @OneToMany(() => SharedCalendarAccessToken, (token) => token.account)
  sharedCalendarAccessTokens: SharedCalendarAccessToken[];

  // TODO: Revoir si la relation Company (OneToOne) a bien été ajoutée.
}
