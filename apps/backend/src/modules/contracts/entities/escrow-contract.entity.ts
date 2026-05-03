import {
  Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne,
  CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { Harvest } from '../../harvests/entities/harvest.entity';
import { Farmer } from '../../farmers/entities/farmer.entity';
import { ContractStatus } from './contract-status.enum';

@Entity('escrow_contracts')
export class EscrowContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  stellarContractId: string;

  @Column()
  buyerPublicKey: string;

  @Column({ nullable: true })
  buyerName: string;

  @Column('decimal', { precision: 18, scale: 7 })
  amountUsdc: number;

  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.PENDING })
  status: ContractStatus;

  @Column({ nullable: true })
  expectedWeightKg: number;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  deliveryConfirmedAt: Date;

  @Column({ nullable: true })
  disputeReason: string;

  @Column({ nullable: true })
  fundTxHash: string;

  @Column({ nullable: true })
  releaseTxHash: string;

  @OneToOne(() => Harvest, { eager: true })
  @JoinColumn()
  harvest: Harvest;

  @Column()
  harvestId: string;

  @ManyToOne(() => Farmer, { eager: true })
  @JoinColumn()
  farmer: Farmer;

  @Column()
  farmerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
