import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty()
  @IsString()
  harvestId: string;

  @ApiProperty()
  @IsString()
  buyerPublicKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  amountUsdc: number;

  @ApiProperty()
  @IsNumber()
  expectedWeightKg: number;

  @ApiProperty()
  @IsDateString()
  expiryDate: string;
}

export class DisputeContractDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
