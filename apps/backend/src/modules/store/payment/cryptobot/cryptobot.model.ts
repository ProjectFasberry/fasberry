import { currencyCryptoSchema } from "@repo/shared/constants/currencies";
import { 
  getEconomyByTarget, 
  getOrderInitiatorIndexKey, 
  getOrderKey, 
  getOrderLink, 
  getPriceInCurrency, 
  PaymentCacheData, 
  rollbackOrder, 
  validateOrderLimit 
} from "../create-crypto-order";
import { logger } from "#/utils/config/logger";
import { CreateOrderTopUpSchema, OrderInputPayload, OutputPayload } from "@repo/shared/schemas/payment";
import { getRedis } from "#/shared/redis/init";
import { nanoid } from "nanoid";
import { DEFAULT_EXPIRATION_DATE } from "#/shared/constants/invoice-defaults";
import { CRYPTO_PAY_API } from "#/shared/api/crypto-api";
import { ExchangeRate, InvoiceType } from "#/shared/types/payment/payment-types";
import { z } from "zod"
import { getRedisKey } from "#/helpers/redis";

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
  totalPrice: number;
  asset: z.infer<typeof currencyCryptoSchema>,
  initiator: string,
  recipient: string,
  target: CreateOrderTopUpSchema["target"],
  value: CreateOrderTopUpSchema["value"],
  comment: CreateOrderTopUpSchema["comment"]
}

export type CryptoPayPayload<T> = { ok: boolean, result: T }

async function createCryptoOrder({
  totalPrice, asset, initiator, value, target, comment
}: CreateCryptoOrder) {
  const allowed = await validateOrderLimit(initiator);
  if (!allowed) throw new Error("Вы превысили лимит заказов. Подождите и попробуйте позже.");

  const redis = getRedis()

  const uniqueId = nanoid(10)
  const callbackUrl = getOrderLink(uniqueId)
  const description = `Заказ #${uniqueId}. Подробнее о заказе: ${callbackUrl}`;
  const price = totalPrice.toString()
  const payload = `Покупка ${value} ${target} за ${price} ${asset}`

  const createInvoicePayload: CreateInvoicePayload = {
    currency_type: "crypto",
    asset,
    amount: price,
    description,
    paid_btn_name: "callback",
    paid_btn_url: callbackUrl,
    payload,
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
    payload,
    order_id: createdInvoice.result.hash,
    invoice_id: createdInvoice.result.invoice_id,
    pay_url: createdInvoice.result.pay_url,
    initiator,
    comment
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

export async function processStoreCryptoPurchaseCryptobot({
  recipient, method: { currency }, comment, target, value, initiator
}: OrderInputPayload): Promise<OutputPayload> {
  const { success: isCrypto, data: asset } = currencyCryptoSchema.safeParse(currency);
  if (!isCrypto) throw new Error("Incorrect currency. Should be from crypto list");

  const economyTarget = await getEconomyByTarget(target);

  const totalValue = value * Number(economyTarget.value)
  const totalPrice = await getPriceInCurrency(totalValue, asset)

  const input = {
    totalPrice, target, value, asset, recipient, initiator, comment
  }

  logger.withTag("Order").log(input)

  const payment = await createCryptoOrder(input);
  if (!payment.ok) throw new Error("Incorrect creating order");

  const { invoice_id: invoiceId, hash: orderId, pay_url: url, uniqueId } = payment.result

  const data = { invoiceId, orderId, url, uniqueId, totalPrice };

  logger.withTag("Order").log(data)

  return data
}

export const EXCHANGE_RATES_KEY = getRedisKey("external", "exchange-rates:data");
const EXCHANGE_RATES_PREVIOUS_KEY = getRedisKey("external", "exchange-rates:data:previous");

export async function updateExchangeRates() {
  const redis = getRedis();

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