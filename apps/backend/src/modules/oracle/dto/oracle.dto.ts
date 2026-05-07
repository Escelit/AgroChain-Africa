import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OracleDeliveryDto {
  @ApiProperty()
  @IsString()
  contractId: string;

  @ApiProperty()
  @IsObject()
  sensorData: {
    weightKg: number;
    deviceId: string;
    signature: string;
    timestamp: number;
  };
}
