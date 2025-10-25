import { Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

export interface ExpressReturnType {
  out_trade_no: string;
  trade_no: string;
  status: string;
  trade_token: string;
}

export interface ReferenceReturnType {
  out_trade_no: string;
  reference_id: string;
  trade_no: string;
  entity_id: string;
  status: string;
  trade_token: string;
  dynamic_link: string;
}

export class PayPayService {
  private readonly API_URL = 'https://gateway.paypayafrica.com/recv.do';
  private readonly paternId = process.env.PATHERID ?? '123456';
  private readonly privateKey = process.env.PAYPAY_PRIVATE as string;
  private readonly KULONGA_URL = process.env.CHEKOUTLINK;
  private readonly KULONGA_KEY = process.env.KULONGA_KEY as string;

  public async payWithExpress({
    amount,
    telefone,
    userid,
    productid,
    orderId,
  }: {
    amount: string;
    telefone: string;
    userid: number;
    productid: number;
    orderId: number;
  }) {
    try {
      const Url = `https://culonga.com/culongaPay/index.php?callback=${this.KULONGA_URL}/${productid}&idCliente=1&idCompra=${orderId}&idProduto=${productid}&preco=${amount}&token=${this.KULONGA_KEY}`;
      return {
        out_trade_no: orderId,
        payurl: Url,
      };
    } catch (error) {
      return error;
    }
  }

  public async payWithPayPay({ amount }: { amount: string }) {
    amount = String(Number(amount) * 0.95);
    const bizContentData = {
      payer_ip: 'user_ip',
      timeout_express: '10m',
      sale_product_code: '050200030',
      cashier_type: 'SDK',
      trade_info: {
        currency: 'AOA',
        out_trade_no: `ORDER_${Date.now()}`,
        payee_identity: this.paternId,
        payee_identity_type: '1',
        price: parseFloat(amount),
        quantity: '1',
        subject: 'Catering expenses',
        total_amount: parseFloat(amount),
      },
    };
    const encryptedBizContent = this.encryptAndBase64(
      JSON.stringify(bizContentData),
      this.privateKey,
    );
    const requestBody = {
      request_no: `ORDER_${Date.now()}`,
      service: 'instant_trade',
      version: '1.0',
      partner_id: this.paternId,
      charset: 'UTF-8',
      language: 'pt',
      sign_type: 'RSA',
      timestamp: this.getCurrentTimestamp(),
      format: 'JSON',
      biz_content: encryptedBizContent,
    };
    this.generateSignature(requestBody);
    for (const key in requestBody) {
      if (
        requestBody.hasOwnProperty(key) &&
        key !== 'sign' &&
        key !== 'sign_type'
      ) {
        requestBody[key] = encodeURIComponent(requestBody[key]);
      }
    }
    const response = await axios.post(this.API_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data: ReferenceReturnType = response.data?.biz_content;
    return data;
  }

  public async payWithReference({ amount }: { amount: string }) {
    return {
      out_trade_no: `ORDER_${Date.now()}`,
      reference: '802762828',
      entity: '10116',
    };
  }

  private generateSignature(requestBody: any) {
    const sortedKeys = Object.keys(requestBody).sort();
    const paramString = sortedKeys
      .filter((key) => key !== 'sign' && key !== 'sign_type')
      .map((key) => `${key}=${requestBody[key]}`)
      .join('&');

    const sign = crypto.createSign('RSA-SHA1');
    sign.update(paramString);
    const signature = sign.sign(this.privateKey, 'base64');

    requestBody.sign = signature;
    requestBody.sign_type = 'RSA';

    return signature;
  }

  private getCurrentTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  }

  private encryptAndBase64(data: string, privateKey: string) {
    const buf = Buffer.from(data, 'utf8');

    const keySize = 128; // 1024 / 8
    const maxChunk = keySize - 11;

    const encryptedChunks: Buffer[] = [];
    for (let offset = 0; offset < buf.length; offset += maxChunk) {
      const slice = buf.slice(offset, offset + maxChunk);

      const encrypted = crypto.privateEncrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        slice,
      );

      encryptedChunks.push(encrypted);
    }

    return Buffer.concat(encryptedChunks).toString('base64');
  }
}
