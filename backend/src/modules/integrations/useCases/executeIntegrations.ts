import { Logger } from '@nestjs/common';
import { convertCurrency } from 'src/services/convert';
import DatabaseService from 'src/services/database/database.service';

export default async function ExuteMyWebhooks(
  userid: string,
  database: DatabaseService,
  paymentId: string,
) {
  const logger = new Logger('WebHooks');
  try {
    const [payments, myIntegtaions] = await Promise.all([
      database.payment.findUnique({
        where: {
          uuid: paymentId,
        },
      }),
      database.integration.findMany({
        where: { userid },
        select: {
          url: true,
          platform: true,
          user: true,
        },
      }),
    ]);

    if (!paymentId) {
      return 'Pagamento não encontrado';
    }
    if (!myIntegtaions || myIntegtaions.length === 0) {
      return 'Sem integrações';
    }
    let product: any;

    if (payments) {
      product = await database.products.findFirst({
        where: {
          id: payments.productId,
        },
      });
    }
    const responses = await Promise.all(
      myIntegtaions.map(async (item) => {
        try {
          const platform = JSON.parse(item.platform) as { title: string };
          let User;
          if (payments) {
            User = JSON.parse(payments?.user as any) as {
              name: string;
              telefone: string;
              email: string;
            };
          }
          if (platform?.title.toLocaleLowerCase().includes('utm')) {
            const convertedAmount = await convertCurrency(
              payments?.amount as number,
              'USD',
            );
            const convertedAmountInCents = Math.round(convertedAmount * 100);
            const postRes = await fetch(
              `https://api.utmify.com.br/api-credentials/orders`,
              {
                method: 'POST',
                headers: {
                  'Content-type': 'application/json',
                  'x-api-token': item.url,
                },
                body: JSON.stringify({
                  orderId: crypto.randomUUID(),
                  platform: 'NublaPay',
                  paymentMethod: 'pix',
                  status: 'paid',
                  createdAt: new Date(),
                  refundedAt: null,
                  approvedDate: null,
                  customer: {
                    name: User.name,
                    email: User.email,
                    phone: User.telefone,
                    document: '29672656599',
                    country: 'BR',
                    ip: '61.145.134.105',
                  },
                  products: [
                    {
                      id: crypto.randomUUID(),
                      name:
                        product?.title ??
                        `Produto Desconhecido ${crypto.randomUUID()}`,
                      planId: null,
                      planName: product?.title,
                      quantity: 1,
                      priceInCents: convertedAmountInCents,
                    },
                  ],
                  trackingParameters: {
                    src: null,
                    sck: null,
                    utm_source: 'FB',
                    utm_campaign: 'CAMPANHA_2|413591587909524',
                    utm_medium: 'CONJUNTO_2|498046723566488',
                    utm_content: 'ANUNCIO_2|504346051220592',
                    utm_term: 'Instagram_Feed',
                  },
                  commission: {
                    totalPriceInCents: convertedAmountInCents,
                    gatewayFeeInCents: convertedAmountInCents,
                    userCommissionInCents: convertedAmountInCents,
                  },
                  isTest: false,
                }),
              },
            );
            
            return postRes;
          }
          const res = await fetch(item.url, { method: 'GET' });
          return res;
        } catch (err) {
          return err;
        }
      }),
    );

    responses.forEach((res) => {
      logger.log(res);
      console.log(res);
    });
    return responses;
  } catch (error) {
    logger.log(error);
    return { error: (error as Error).message };
  }
}
