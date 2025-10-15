import { Logger } from "@nestjs/common";

export async function convertCurrency(
  valor: number,
  to: 'USD' | 'BRL' = 'USD',
) {
  const logger = new Logger('CurrencyLogger');
  const apiKey = process.env.API_CONVERSOR_KEY;
  if (!apiKey) {
    logger.error('API key não encontrada');
    return 0;
  }

  try {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/AOA/${to}/${valor}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.result === 'success') {
      logger.log(`${valor} AOA = ${data.conversion_result} ${to}`);
      return data.conversion_result as number;
    } else {
      logger.error(
        `Erro API conversor: ${data['error-type'] ?? 'desconhecido'}`,
      );
      return 0;
    }
  } catch (err) {
    logger.error(`Falha ao converter moeda: ${err}`);
    return 0;
  }
}
