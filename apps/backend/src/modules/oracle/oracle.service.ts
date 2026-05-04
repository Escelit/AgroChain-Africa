import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { OracleDeliveryDto } from './dto/oracle.dto';

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);

  constructor(
    @InjectQueue('oracle-events') private oracleQueue: Queue,
    private config: ConfigService,
  ) {}

  async verifyAndEnqueue(payload: OracleDeliveryDto): Promise<void> {
    // In production: verify ed25519 signature from IoT device
    // For now: basic timestamp freshness check
    const age = Date.now() - payload.sensorData.timestamp;
    if (age > 300_000) {
      throw new Error('Sensor data too old (>5 min)');
    }

    await this.oracleQueue.add('iot-delivery-confirmed', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    this.logger.log(`Delivery event queued for contract ${payload.contractId}`);
  }

  async getNdviForecast(geohash: string, commodity: string) {
    // Stub — real impl calls Sentinel Hub API
    return {
      geohash,
      commodity,
      estimatedYieldKgPerHa: Math.floor(Math.random() * 2000) + 1000,
      confidence: 'MEDIUM',
      ndviScore: (Math.random() * 0.4 + 0.5).toFixed(3),
      updatedAt: new Date(),
    };
  }
}
