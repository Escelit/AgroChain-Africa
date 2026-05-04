import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  amountUsdc: number;

  @ApiProperty({ enum: ['mpesa', 'mtn_momo', 'flutterwave'] })
  @IsEnum(['mpesa', 'mtn_momo', 'flutterwave'])
  anchorId: 'mpesa' | 'mtn_momo' | 'flutterwave';

  @ApiProperty({ example: '+254712345678' })
  @IsString()
  mobileNumber: string;
}
