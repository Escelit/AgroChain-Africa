import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendSMS(phone: string, message: string): Promise<void> {
    // TODO: integrate Africa's Talking or Twilio
    this.logger.log(`SMS to ${phone}: ${message}`);
  }

  async sendPush(userId: string, title: string, body: string): Promise<void> {
    this.logger.log(`Push to ${userId}: ${title} - ${body}`);
  }
}
