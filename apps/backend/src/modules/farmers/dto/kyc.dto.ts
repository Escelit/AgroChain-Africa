import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KycDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  nationalId: string;

  @ApiProperty({ example: 'Amara Diallo' })
  @IsString()
  fullName: string;
}
