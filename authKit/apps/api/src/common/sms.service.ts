import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: Twilio.Twilio | null;

  constructor(private readonly configService: ConfigService) {
    const sid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = sid && token ? Twilio(sid, token) : null;
  }

  async sendMfaSms(phoneNumber: string, code: string) {
    const from = this.configService.get<string>('TWILIO_FROM_PHONE');
    if (!this.client || !from) {
      this.logger.log(`Mock MFA SMS to ${phoneNumber}: ${code}`);
      return;
    }

    await this.client.messages.create({
      body: `AuthKit MFA code: ${code}`,
      from,
      to: phoneNumber,
    });
  }
}
