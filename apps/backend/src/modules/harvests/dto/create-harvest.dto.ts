import { IsString, IsNumber, IsDateString, IsOptional, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Commodity {
  MAIZE = 'MAIZE',
  COFFEE = 'COFFEE',
  COCOA = 'COCOA',
  SOYBEAN = 'SOYBEAN',
  CASSAVA = 'CASSAVA',
  WHEAT = 'WHEAT',
  RICE = 'RICE',
}

export enum Grade {
  AA = 'AA',
  AB = 'AB',
  B = 'B',
  C = 'C',
}

export class CreateHarvestDto {
  @ApiProperty({ enum: Commodity })
  @IsEnum(Commodity)
  commodity: Commodity;

  @ApiProperty({ enum: Grade })
  @IsEnum(Grade)
  grade: Grade;

  @ApiProperty({ minimum: 50 })
  @IsNumber()
  @Min(50)
  weightKg: number;

  @ApiProperty({ example: 'u4pruydqqvj' })
  @IsString()
  locationGeohash: string;

  @ApiProperty()
  @IsDateString()
  harvestDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  moistureContent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedValueUsdc?: number;
}
