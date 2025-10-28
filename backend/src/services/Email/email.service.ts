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
    
    if (currentDay >= 26 && currentDay <= 27) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Culonga" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html,
        });

        this.logger.log(`E-mail enviado: ${JSON.stringify(info, null, 2)}`);
        return 'EMAIL';
      } catch (error: any) {
        this.logger.error('Erro ao enviar e-mail', error.message);
        throw error;
      }
    }
    this.logger.warn('Envio de e-mails bloqueado. , Limmite atingido de emails enviados no plano starter');
    return;
  }
}
