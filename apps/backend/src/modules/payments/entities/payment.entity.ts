import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, JoinColumn,
} from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entity';

export enum PaymentType {
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT',
  ANCHOR_WITHDRAWAL = 'ANCHOR_WITHDRAWAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column('decimal', { precision: 18, scale: 7 })
  amountUsdc: number;

  @Column({ nullable: true })
  stellarTxHash: string;

  @Column({ nullable: true })
  anchorTransactionId: string;

  @Column({ nullable: true })
  mobileNumber: string;

  @Column({ nullable: true })
  memo: string;

  @ManyToOne(() => Farmer, { eager: true })
  @JoinColumn()
  farmer: Farmer;

  @Column()
  farmerId: string;

  @CreateDateColumn()
  createdAt: Date;
}
