import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmailVerification(email: string, token: string) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const fromEmail = this.configService.get<string>(
      'SENDGRID_FROM_EMAIL',
      'noreply@authkit.dev',
    );
    const verifyUrl = `${this.configService.get<string>(
      'WEB_URL',
      'http://localhost:3001',
    )}/verify-email?token=${token}`;

    if (!apiKey) {
      this.logger.log(`Mock verify email for ${email}: ${verifyUrl}`);
      return;
    }

    await sgMail.send({
      to: email,
      from: fromEmail,
      subject: 'Verify your email address',
      html: `<p>Welcome to AuthKit.</p><p>Verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
  }

  async sendMfaEmail(email: string, code: string) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const fromEmail = this.configService.get<string>(
      'SENDGRID_FROM_EMAIL',
      'noreply@authkit.dev',
    );

    if (!apiKey) {
      this.logger.log(`Mock MFA email to ${email}: ${code}`);
      return;
    }

    await sgMail.send({
      to: email,
      from: fromEmail,
      subject: 'Your AuthKit MFA code',
      html: `<p>Your verification code is <strong>${code}</strong></p>`,
    });
  }
}
