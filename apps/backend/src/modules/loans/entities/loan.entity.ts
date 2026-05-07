import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entity';
import { LoanStatus } from '../dto/loan.dto';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  stellarLoanId: string;

  @Column()
  lenderPublicKey: string;

  @Column('decimal', { precision: 18, scale: 7 })
  principalUsdc: number;

  @Column('decimal', { precision: 18, scale: 7, default: 0 })
  repaidUsdc: number;

  @Column()
  interestBps: number;

  @Column()
  durationDays: number;

  @Column()
  dueDate: Date;

  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.ACTIVE })
  status: LoanStatus;

  @Column()
  harvestId: string;

  @ManyToOne(() => Farmer, { eager: true })
  @JoinColumn()
  farmer: Farmer;

  @Column()
  farmerId: string;

  @Column({ nullable: true })
  disburseTxHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
