import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChallengeDto {
  @ApiProperty({ example: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37' })
  @IsString()
  publicKey: string;
}

export class VerifyDto {
  @ApiProperty()
  @IsString()
  publicKey: string;

  @ApiProperty({ description: 'Base64-encoded signed XDR transaction' })
  @IsString()
  signedXdr: string;
}
