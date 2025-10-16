import { ForbiddenException, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
export default class EmailService {
  private readonly transporter;
  private readonly logger = new Logger('EmailService');

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  public async senEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const today = new Date();
    const currentDay = today.getDate();

    if (currentDay > 26) {
      this.logger.warn('Envio de e-mails bloqueado.');
      throw new ForbiddenException(
        'Envio de e-mails desativado, por favor carrgeue sua conta.',
      );
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"kulonga" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`E-mail enviado: ${info.messageId}`);
      return 'EMAIL';
    } catch (error: any) {
      this.logger.error('Erro ao enviar e-mail', error.message);
      throw error;
    }
  }
}
