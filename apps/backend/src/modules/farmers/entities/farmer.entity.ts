import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Harvest } from '../../harvests/entities/harvest.entity';

@Entity('farmers')
export class Farmer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  stellarPublicKey: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  nationalIdHash: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ default: 'KE' })
  countryCode: string;

  @Column({ default: 0 })
  onChainCreditScore: number;

  @Column({ default: false })
  kycVerified: boolean;

  @Column({ nullable: true })
  kycVerifiedAt: Date;

  @OneToMany(() => Harvest, (h) => h.farmer, { lazy: true })
  harvests: Promise<Harvest[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
