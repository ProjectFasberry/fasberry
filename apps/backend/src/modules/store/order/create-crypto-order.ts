import { CRYPTO_PAY_API } from "#/shared/api/crypto-api";
import { payments } from "#/shared/database/payments-db";
import { getRedis } from "#/shared/redis/init";
import { ExchangeRate } from "#/shared/types/payment/payment-types";
import { logger } from "#/utils/config/logger";
import { currencyCryptoSchema } from "@repo/shared/schemas/entities/currencies-schema";
import { PaymentStatus } from "@repo/shared/types/db/payments-database-types";
import { z } from "zod";
import { FRONTEND_PREFIX } from "#/shared/env";
import { CreateOrderTopUpSchema } from "@repo/shared/schemas/payment";
import { general } from "#/shared/database/main-db";
import { CryptoPayPayload, EXCHANGE_RATES_KEY } from "./cryptobot/cryptobot.model";

export const getOrderLink = (uniqueId: string) => `${FRONTEND_PREFIX}/store/order/${uniqueId}`
export const getOrderKey = (uniqueId: string) => `order:${uniqueId}`
export const getOrderInitiatorIndexKey = (initiator: string) => `index:initiator:${initiator}`
export const getOrderRateKey = (initiator: string) => `rate:order_limit:${initiator}`

export type PaymentCacheData = {
  unique_id: string;
  asset: "USDT" | "TON" | "BTC" | "ETH" | "LTC" | "BNB" | "TRX" | "USDC";
  price: string;
  created_at: Date | string;
  status: PaymentStatus;
  payload: string;
  order_id: string;
  invoice_id: number;
  pay_url: string,
  initiator: string
  comment: CreateOrderTopUpSchema["comment"]
}

const ORDER_LIMIT = 64;
const WINDOW_SECONDS = 10 * 60;

function extractDiff(rubPrice: number, exchangeRate: number): number {
  const priceInTargetCurrency = rubPrice / exchangeRate;
  return parseFloat(priceInTargetCurrency.toFixed(8));
}

export async function getExchangeRates() {
  const redis = getRedis()
  return redis.get(EXCHANGE_RATES_KEY)
}

export async function getEconomyByTarget(target: string) {
  return general
    .selectFrom("store_economy")
    .select(["value", "type"])
    .where("type", "=", target)
    .executeTakeFirstOrThrow()
}

export async function getPriceInCurrency(
  inputPrice: number,
  currency: z.infer<typeof currencyCryptoSchema>
): Promise<number> {
  const data = await getExchangeRates()
  if (!data) throw new Error("Exchange rates cache is not defined")

  const rates: ExchangeRate[] = JSON.parse(data)

  const target = rates.find(
    target => target.source === currency && target.target === "RUB"
  )

  if (!target) throw new Error("Выбранная валюта некорректна")

  const outputPrice = extractDiff(inputPrice, Number(target.rate))
  return outputPrice;
}

export async function rollbackOrder({
  invoiceId, uniqueId, initiator
}: {
  invoiceId: number, uniqueId: string, initiator: string
}) {
  const deleteInvoice = await payments.transaction().execute(async (trx) => {
    const redis = getRedis();

    const deleteInvoice = await CRYPTO_PAY_API
      .post(`deleteInvoice`, { json: { invoice_id: invoiceId } })
      .json<CryptoPayPayload<boolean>>()

    if (!deleteInvoice.ok) return;

    logger.log(`Deleted invoice ${invoiceId} - ${deleteInvoice.result}`)

    await Promise.all([
      redis.del(getOrderKey(uniqueId)),
      redis.del(getOrderInitiatorIndexKey(initiator))
    ])

    return true;
  })

  return deleteInvoice ?? false
}

export async function validateOrderLimit(initiator: string): Promise<boolean> {
  const redis = getRedis();
  const key = getOrderRateKey(initiator)

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  return count <= ORDER_LIMIT;
}