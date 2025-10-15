import { IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class PaypayNotifyDto {
  /** 1641546460908 */
  @IsString()
  gmt_create: string;

  /** "100.37" – valor monetário em string com duas casas decimais */
  @IsNumberString()
  amount: string;

  /** 1641546465878 */
  @IsString()
  gmt_payment: string;

  /** "20220120111833" */
  @IsString()
  @Length(14, 14)
  notify_time: string;

  /** "924***323" (ofuscado) */
  @IsString()
  payerIdentity: string;

  /** "partner" */
  @IsString()
  role: string;

  /** "UTF-8" */
  @IsString()
  input_charset: string;

  /** assinatura RSA em Base64 (string longa) */
  @IsString()
  sign: string;

  /** 1642673913264 */
  @IsString()
  notify_create: string;

  /** "a146a25b97b14399a20acfe24bfccaaa" */
  @IsString()
  notify_id: string;

  /** "trade_status_sync" */
  @IsString()
  notify_type: string;

  /** "l******n@zsaipay.com" */
  @IsString()
  payeeIdentity: string;

  /** "2475996115" – seu número de pedido */
  @IsString()
  out_trade_no: string;

  /** "101164154646089866469" – número da PayPay */
  @IsString()
  inner_trade_no: string;

  /** 1642673910000 (pode não vir em todas as notificações) */
  @IsOptional()
  @IsString()
  gmt_close?: string;

  /** "RSA" */
  @IsString()
  sign_type: string;

  /** "TRADE_SUCCESS" | "TRADE_CLOSED" | "REFUND_SUCCESS" … */
  @IsString()
  status: string;
}
