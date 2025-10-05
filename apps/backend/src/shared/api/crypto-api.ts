import ky from "ky";
import { isProduction } from "../env";

export const CRYPTO_PAY_API = ky.create({
  prefixUrl: isProduction ? Bun.env.CRYPTO_PAY_MAINNET_URL : Bun.env.CRYPTO_PAY_TESTNET_URL,
  headers: {
    "Crypto-Pay-API-Token": isProduction ? Bun.env.CRYPTO_PAY_MAINNET_TOKEN : Bun.env.CRYPTO_PAY_TESTNET_TOKEN,
  }
})