import { CRYPTO_PAY_API } from "#/shared/api/crypto-api";
import { DEFAULT_EXPIRATION_DATE } from "#/shared/constants/invoice-defaults";
import { payments } from "#/shared/database/payments-db";
import { getRedisClient } from "#/shared/redis/init";
import { ExchangeRate, InvoiceType } from "#/shared/types/payment/payment-types";
import { logger } from "#/utils/config/logger";
import { EXCHANGE_RATES_KEY } from "#/utils/workers/currencies";
import { currencyCryptoSchema } from "@repo/shared/schemas/entities/currencies-schema";
import { PaymentStatus } from "@repo/shared/types/db/payments-database-types";
import { nanoid } from "nanoid";
import { z } from "zod/v4";

type CreateInvoicePayload = Pick<InvoiceType,
  | "currency_type"
  | "asset"
  | "amount"
  | "description"
  | "hidden_message"
  | "paid_btn_name"
  | "paid_btn_url"
  | "payload"
> & {
  expires_in?: number
}

type CreateCryptoOrder = {
  products: Array<{
    recipient: string | undefined;
    id: number;
    price: string;
    type: string;
    title: string;
    value: string;
    currency: string;
  }>,
  details: {
    totalPrice: number;
    asset: z.infer<typeof currencyCryptoSchema>,
    type: "store" | "economy",
    initiator: string
  }
}

export type CryptoPayPayload<T> = { ok: boolean, result: T }

function extractDiff(rubPrice: number, exchangeRate: number): number {
  const priceInTargetCurrency = rubPrice / exchangeRate;
  return parseFloat(priceInTargetCurrency.toFixed(8));
}

async function getPriceInCurrency(
  inputPrice: number,
  currency: z.infer<typeof currencyCryptoSchema>
): Promise<number> {
  const redis = getRedisClient()

  const data = await redis.get(EXCHANGE_RATES_KEY)

  if (!data) {
    throw new Error("Exchange rates cache is not defined")
  }

  const rates: ExchangeRate[] = JSON.parse(data)

  const target = rates.find(
    target => target.source === currency && target.target === "RUB"
  )

  if (!target) {
    throw new Error("Выбранная валюта некорректна")
  }

  const outputPrice = extractDiff(inputPrice, Number(target.rate))

  return outputPrice;
}

export async function rollbackOrder({
  invoiceId, uniqueId, initiator
}: {
  invoiceId: number, uniqueId: string, initiator: string
}) {
  const deleteInvoice = await payments.transaction().execute(async (trx) => {
    const redis = getRedisClient();

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

export const getOrderLink = (uniqueId: string) => `https://app.fasberry.su/store/order/${uniqueId}`
export const getOrderKey = (uniqueId: string) => `order:${uniqueId}`
export const getOrderInitiatorIndexKey = (initiator: string) => `index:initiator:${initiator}`
const getOrderRateKey = (initiator: string) => `rate:order_limit:${initiator}`

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
}

const ORDER_LIMIT = 64;
const WINDOW_SECONDS = 10 * 60;

async function validateOrderLimit(initiator: string): Promise<boolean> {
  const redis = getRedisClient();
  const key = getOrderRateKey(initiator)

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  return count <= ORDER_LIMIT;
}

export async function createCryptoOrder({
  products, details: { totalPrice, asset, initiator, ...details }
}: CreateCryptoOrder) {
  const allowed = await validateOrderLimit(initiator);

  if (!allowed) {
    throw new Error("Вы превысили лимит заказов. Подождите и попробуйте позже.");
  }

  const redis = getRedisClient()

  const amount = await getPriceInCurrency(totalPrice, asset)
  const uniqueId = nanoid(10)
  const callbackUrl = getOrderLink(uniqueId)
  const description = `Заказ #${uniqueId}. Подробнее о заказе: ${callbackUrl}`;
  const meta = JSON.stringify(products)
  const price = "0.05"
  // amount.toString()

  const createInvoicePayload: CreateInvoicePayload = {
    currency_type: "crypto",
    asset: "TON",
    amount: price,
    description,
    paid_btn_name: "callback",
    paid_btn_url: callbackUrl,
    payload: meta,
    expires_in: DEFAULT_EXPIRATION_DATE
  }

  const createdInvoice = await CRYPTO_PAY_API
    .post("createInvoice", { json: createInvoicePayload })
    .json<CryptoPayPayload<InvoiceType>>()

  const orderKey = getOrderKey(uniqueId)

  const orderData: PaymentCacheData = {
    unique_id: uniqueId,
    asset,
    price,
    created_at: new Date().toISOString(),
    status: "pending",
    payload: meta,
    order_id: createdInvoice.result.hash,
    invoice_id: createdInvoice.result.invoice_id,
    pay_url: createdInvoice.result.pay_url,
    initiator
  }

  logger.success(`Created invoice ${createdInvoice.result.invoice_id}, saved to Redis`)

  const success = await redis.set(
    orderKey,
    JSON.stringify(orderData),
    "EX",
    DEFAULT_EXPIRATION_DATE
  )

  const indexRecipientKey = getOrderInitiatorIndexKey(initiator)

  await redis.sadd(indexRecipientKey, orderKey);
  await redis.expire(indexRecipientKey, DEFAULT_EXPIRATION_DATE);

  if (!success) {
    await rollbackOrder({ 
      uniqueId, invoiceId: createdInvoice.result.invoice_id, initiator 
    });
    
    throw new Error("Failed to insert order into database.");
  }

  const data = {
    ...createdInvoice,
    result: {
      ...createdInvoice.result,
      uniqueId: uniqueId
    }
  }

  return data
}