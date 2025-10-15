import { Logger } from '@nestjs/common';
import axios from 'axios';

export default class MessagingService {
  async sendMessage(
    to: string,
    link: string,
    sellerSuport: string | undefined | null,
  ) {
    const logger = new Logger('SMS');
    const auth_id = process.env.SMS_ID ?? '';
    const secret_key = process.env.SMS_KEY ?? '';
    const from = process.env.SMS_FROM ?? '';
    const server = process.env.SMS_URL_API ?? '';

    const message = `🎉 Parabéns! Sua compra foi efectuada com sucesso!
🔗 Clique no link abaixo para teres acesso aos seus produtos:
${link}
${sellerSuport && `
Suporte do vendedor whatsapp: ‪+244 ${sellerSuport}‬`
    }
💬 Suporte da plataforma Nublapay: ‪+244 922 718 735‬
Obrigado!`;

    console.log(message, link);
    const url = `${server}?to=${to}&message=${encodeURIComponent(message)}&auth_id=${auth_id}&secret_key=${secret_key}&from=${from}`;
    try {
      const response = await axios.get(url);
      logger.log('SMS enviado com sucesso:', response.data);
      return response.data as string;
    } catch (error: any) {
      logger.error(
        'Erro ao enviar SMS:',
        error.response?.data || error.message,
      );
      return error.response?.data || error.message || 'Erro desconhecido';
    }
  }
  async sendAny(to: string, message: string) {
    const logger = new Logger('SMS');
    const auth_id = process.env.SMS_ID ?? '';
    const secret_key = process.env.SMS_KEY ?? '';
    const from = process.env.SMS_FROM ?? '';
    const server = process.env.SMS_URL_API ?? '';
    const url = `${server}?to=${to}&message=${encodeURIComponent(message)}&auth_id=${auth_id}&secret_key=${secret_key}&from=${from}`;
    try {
      const response = await axios.get(url);
      logger.log('SMS enviado com sucesso:', response.data);
      return response.data as string;
    } catch (error: any) {
      logger.error(
        'Erro ao enviar SMS:',
        error.response?.data || error.message,
      );
      return error.response?.data || error.message || 'Erro desconhecido';
    }
  }
}
