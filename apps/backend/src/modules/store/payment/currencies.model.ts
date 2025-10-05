import { getRedisKey } from "#/helpers/redis";
import { CRYPTO_PAY_API } from "#/shared/api/crypto-api";
import { getRedisClient } from "#/shared/redis/init";
import { ExchangeRate } from "#/shared/types/payment/payment-types";
import { logger } from "#/utils/config/logger";
import { CryptoPayPayload } from "./create-crypto-order";

export const EXCHANGE_RATES_KEY = getRedisKey("external", "exchange-rates:data");
export const EXCHANGE_RATES_PREVIOUS_KEY = getRedisKey("external", "exchange-rates:data:previous");

export async function updateExchangeRates() {
  const redis = getRedisClient();

  try {
    const data = await CRYPTO_PAY_API("getExchangeRates").json<CryptoPayPayload<ExchangeRate[]>>()

    if (!data.ok) {
      throw new Error()
    }

    const value = JSON.stringify(data.result);
    const current = await redis.get(EXCHANGE_RATES_KEY);

    if (current) {
      await redis.set(EXCHANGE_RATES_PREVIOUS_KEY, current);
    }

    await redis.set(EXCHANGE_RATES_KEY, value);
  } catch (e) {
    const exists = await redis.exists(EXCHANGE_RATES_KEY);

    if (!exists) {
      const fallback = await redis.get(EXCHANGE_RATES_PREVIOUS_KEY);

      if (fallback) {
        await redis.set(EXCHANGE_RATES_KEY, fallback);
        logger.warn(`Restored previous exchanges rates cache`);
      } else {
        logger.error(`No exchanges rates cache and no fallback available`);
      }
    }
  }
}