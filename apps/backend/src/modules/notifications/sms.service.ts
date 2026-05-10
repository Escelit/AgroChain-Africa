import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsResult {
  messageId: string;
  status: string;
  cost: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly username: string;

  constructor(private config: ConfigService) {
    this.apiKey = config.get('AFRICASTALKING_API_KEY') || '';
    this.username = config.get('AFRICASTALKING_USERNAME') || 'sandbox';
  }

  async send(to: string, message: string): Promise<SmsResult> {
    if (!this.apiKey) {
      this.logger.log(`[SMS MOCK] To: ${to} | ${message}`);
      return { messageId: `mock-${Date.now()}`, status: 'Success', cost: '0' };
    }

    const baseUrl = this.username === 'sandbox'
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://api.africastalking.com/version1/messaging';

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        apiKey: this.apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ username: this.username, to, message }),
    });

    const data = await res.json();
    const recipient = data?.SMSMessageData?.Recipients?.[0];
    this.logger.log(`SMS sent to ${to}: ${recipient?.status}`);
    return {
      messageId: recipient?.messageId || '',
      status: recipient?.status || 'Unknown',
      cost: recipient?.cost || '0',
    };
  }

  async sendBulk(recipients: string[], message: string): Promise<void> {
    await Promise.allSettled(recipients.map(r => this.send(r, message)));
  }
}
