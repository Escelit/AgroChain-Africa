import { Injectable, Logger } from '@nestjs/common';
import { SmsService } from './sms.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private smsService: SmsService) {}

  async sendSMS(phone: string, message: string): Promise<void> {
    await this.smsService.send(phone, message);
  }

  async sendPush(userId: string, title: string, body: string): Promise<void> {
    // TODO: integrate Firebase Cloud Messaging
    this.logger.log(`Push to ${userId}: ${title} - ${body}`);
  }
}
