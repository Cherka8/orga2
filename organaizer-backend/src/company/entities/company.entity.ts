import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../auth/entities/account.entity'; // Chemin relatif vers Account

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'account_id' }) // Spécifie la colonne de la clé étrangère
  account: Account;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'company_name' })
  companyName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  industry: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'company_phone' })
  companyPhone: string;

  @Column({ type: 'text', nullable: true, name: 'company_address' })
  companyAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'company_city' })
  companyCity: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'company_postal_code' })
  companyPostalCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'company_country' })
  companyCountry: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Potentiellement, d'autres relations ou champs spécifiques à Company plus tard
}
