import crypto from 'node:crypto';

export default function VerifySignature(payload: Record<string, any>): boolean {
  const publicKey = process.env.PAYPAY_PUBLIC as string;

  // Clone e ordene os campos, excluindo `sign` e `sign_type`
  const { sign, sign_type, ...rest } = payload;

  const sorted = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('&');

  const verifier = crypto.createVerify('RSA-SHA1');
  verifier.update(sorted, 'utf8');
  return verifier.verify(publicKey, sign, 'base64');
}
