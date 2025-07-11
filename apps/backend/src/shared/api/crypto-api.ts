import ky from "ky";

export const CRYPTO_PAY_API = ky.extend({
  prefixUrl: Bun.env.CRYPTO_PAY_MAINNET_URL,
  headers: {
    "Crypto-Pay-API-Token": Bun.env.CRYPTO_PAY_MAINNET_TOKEN,
  }
})