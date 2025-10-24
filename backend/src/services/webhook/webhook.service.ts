import { Logger } from '@nestjs/common';

export default class WebHookService {
  private readonly logger = new Logger('WebHook');
  private readonly webhookPath =
    'https://api.pushcut.io/girhTXhktr7jie0R1Yj2y/notifications/Venda%20Realizada';

  public async send() {
    try {
      const data = await fetch(this.webhookPath);
      const res = await data.json();
      this.logger.log(res);
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? 'Erro ao chamar o webhook',
      );
    }
  }
}
