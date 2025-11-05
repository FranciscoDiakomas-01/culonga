import { Logger } from '@nestjs/common';
import DatabaseService from 'src/services/database/database.service';

export default class PriceVerifier {
  private readonly logger = new Logger('PriceVerier');

  constructor(private readonly database: DatabaseService) {}
  public async verify(orderbumps: string[], amount: number, productId: string) {
    try {
      const [product] = await Promise.all([
        this.database.products.findFirst({ where: { id: productId } }),
      ]);
      // Base: pode ser oferta ou produto
      const baseItem = product;
      if (!baseItem) {
        return { status: false, price: 0, links: [] };
      }

      // Se não houver order bumps
      if (orderbumps.length === 0) {
        return {
          status: baseItem.price === amount,
          price: baseItem.price,
          links: [baseItem.file as string],
        };
      }

      // Buscar os order bumps
      const productsInOrderBumpList = await this.database.products.findMany({
        where: { id: { in: orderbumps } },
        select: { price: true, link: true, file: true },
      });

      const priceSum = productsInOrderBumpList.reduce(
        (acc, item) => acc + item.price,
        0,
      );

      const links = productsInOrderBumpList.map((item) => item.file);
      const total = baseItem.price + priceSum;

      return {
        status: total === amount,
        price: total,
        links: [baseItem.file as string],
        product,
      };
    } catch (error) {
      this.logger.error(
        error?.message ?? error?.error ?? 'Erro ao verificar os produtos',
      );
      return { status: false, price: 0, links: [] };
    }
  }
}
