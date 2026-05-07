import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  REPAID = 'REPAID',
  DEFAULTED = 'DEFAULTED',
  LIQUIDATED = 'LIQUIDATED',
}

export class CreateLoanDto {
  @ApiProperty()
  @IsString()
  harvestId: string;

  @ApiProperty({ description: 'Lender Stellar public key' })
  @IsString()
  lenderPublicKey: string;

  @ApiProperty({ minimum: 10 })
  @IsNumber()
  @Min(10)
  principalUsdc: number;

  @ApiProperty({ description: 'Interest in basis points, e.g. 500 = 5%', minimum: 0, maximum: 5000 })
  @IsNumber()
  @Min(0)
  @Max(5000)
  interestBps: number;

  @ApiProperty({ description: 'Loan duration in days', minimum: 7 })
  @IsNumber()
  @Min(7)
  durationDays: number;
}

export class RepayLoanDto {
  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  amountUsdc: number;
}
