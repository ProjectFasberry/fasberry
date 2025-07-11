import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const ARC_PAY_TOKEN = Bun.env.ARC_PAY_PRIVATE_KEY;
const CRYPTO_PAY_TESTNET_TOKEN = Bun.env.CRYPTO_PAY_TESTNET_TOKEN;
const CRYPTO_PAY_MAINNET_TOKEN = Bun.env.CRYPTO_PAY_MAINNET_TOKEN;

// validate for arc pay
export function validateSignatureArcPay(requestedSignature: string, payload: string) {
  const expectedSignature = new Bun
    .CryptoHasher('sha256', ARC_PAY_TOKEN)
    .update(payload)
    .digest('hex');

  if (!timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(requestedSignature))) {
    throw new Error('Invalid signature');
  }
}

// validate for crypto pay
export function validateSignatureCryptoPay(body: string, resSignature: string) {
  const secret = createHash('sha256')
    .update(CRYPTO_PAY_TESTNET_TOKEN! as string)
    .digest()

  const hmac = createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return hmac === resSignature
}