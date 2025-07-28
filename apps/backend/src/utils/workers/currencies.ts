import Baker from 'cronbake';
import { CRYPTO_PAY_API } from '#/shared/api/crypto-api';
import { getRedisClient } from '#/shared/redis/init';
import { logger } from '../config/logger';
import { ExchangeRate } from '#/shared/types/payment/payment-types';
import { CryptoPayPayload } from '#/modules/store/payment/create-crypto-order';

export const EXCHANGE_RATES_KEY = "cache:external:exchange-rates";
const REDIS_PREVIOUS_KEY = "cache:external:data:previous";

const baker = Baker.create();

async function updateCache() {
  const redis = getRedisClient();

  try {
    const data = await CRYPTO_PAY_API("getExchangeRates").json<CryptoPayPayload<ExchangeRate[]>>()

    if (!data.ok) {
      throw new Error()
    }

    const value = JSON.stringify(data.result);
    const current = await redis.get(EXCHANGE_RATES_KEY);

    if (current) {
      await redis.set(REDIS_PREVIOUS_KEY, current);
    }

    await redis.set(EXCHANGE_RATES_KEY, value);

    logger.log(`[Worker] Cache updated`);
  } catch (err) {
    logger.error(`[Worker] Failed to update cache:`, err);

    const exists = await redis.exists(EXCHANGE_RATES_KEY);

    if (!exists) {
      const fallback = await redis.get(REDIS_PREVIOUS_KEY);

      if (fallback) {
        await redis.set(EXCHANGE_RATES_KEY, fallback);
        logger.warn(`[Worker] Restored previous cache`);
      } else {
        logger.error(`[Worker] No cache and no fallback available`);
      }
    }
  }
}

export function startCacheWorker() {
  baker.add({
    name: "update-api-cache-every-10-minutes",
    cron: "0 */10 * * * *",
    callback: () => {
      updateCache()
      console.log(`[Worker] Updating exchange rates cache at ${new Date().toISOString()}`);
    },
  });

  baker.add({
    name: "warn-before-cache-update",
    cron: "0 5-59/10 * * * *",
    callback: () => {
      logger.log(`[Worker] Exchange rates cache will be updated in 5 minutes`);
    },
  });

  updateCache();

  baker.bakeAll();
}