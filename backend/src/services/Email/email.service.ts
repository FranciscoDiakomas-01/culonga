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
}
