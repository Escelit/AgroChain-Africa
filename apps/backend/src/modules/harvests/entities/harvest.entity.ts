import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne,
  CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entity';
import { HarvestStatus } from './harvest-status.enum';

@Entity('harvests')
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  stellarBatchId: string;

  @Column()
  commodity: string;

  @Column()
  grade: string;

  @Column('decimal', { precision: 10, scale: 2 })
  weightKg: number;

  @Column()
  locationGeohash: string;

  @Column()
  harvestDate: Date;

  @Column({ nullable: true })
  moistureContent: number;

  @Column({ nullable: true })
  estimatedValueUsdc: number;

  @Column({ type: 'enum', enum: HarvestStatus, default: HarvestStatus.DRAFT })
  status: HarvestStatus;

  @Column({ nullable: true })
  txHash: string;

  @ManyToOne(() => Farmer, (f) => f.harvests, { eager: true })
  @JoinColumn()
  farmer: Farmer;

  @Column()
  farmerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
