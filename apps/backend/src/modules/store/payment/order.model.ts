import { Heleket } from "heleket-api-sdk";
import { GAME_CURRENCIES, GameCurrency } from "../store.model";
import { executeSaga, TransactionalTask } from "#/utils/config/saga";
import { callServerCommand } from "#/utils/server/call-command";
import { paymentCurrencySchema } from "@repo/shared/schemas/payment";
import { currencyCryptoSchema, currencyFiatSchema } from "@repo/shared/constants/currencies";
import { createCryptoOrder, getOrderKey, PaymentCacheData } from "./create-crypto-order";
import { processDonatePayment } from "#/utils/payment/process-donate-payment";
import { payments } from "#/shared/database/payments-db";
import { getRedis } from "#/shared/redis/init";
import z from "zod";

async function getCachedOrder(uniqueId: string): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
  const redis = getRedis()
  const redisKey = getOrderKey(uniqueId)

  const data = await redis.get(redisKey)
  if (!data) return null;

  const payload: PaymentCacheData = JSON.parse(data);
  return payload
}

async function getPersistedOrder(uniqueId: string): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
  const dbResult = await payments
    .selectFrom("payments")
    .select([
      "created_at",
      "order_id",
      "price",
      "status",
      "payload",
      "unique_id",
      "pay_url",
      "invoice_id",
      "asset",
      "initiator"
    ])
    .where("unique_id", "=", uniqueId)
    .executeTakeFirst()

  if (dbResult) {
    return { 
      ...dbResult, 
      asset: dbResult.asset as Omit<PaymentCacheData, "expires_in">["asset"] 
    }
  }

  return null;
}

export async function getOrder(uniqueId: string): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
  const cached = await getCachedOrder(uniqueId);
  if (cached) return cached;

  const persisted = await getPersistedOrder(uniqueId);
  return persisted
}

export const ordersRouteSchema = z.object({
  type: z.enum(["succeeded", "all", "pending"]).optional().default("all")
});

export async function getOrders(
  { type }: z.infer<typeof ordersRouteSchema>,
  initiator: string
) {
  const redis = getRedis();

  const keys = await redis.smembers(`index:initiator:${initiator}`);

  const orders: PaymentCacheData[] = await Promise.all(
    keys.map(key => redis.get(key).then(value => JSON.parse(value!)))
  );

  const ordersStatus = type !== 'all' ? type : null

  let paymentsQuery = payments
    .selectFrom("payments")
    .select([
      "unique_id",
      "asset",
      "price",
      "created_at",
      "status",
      "payload",
      "order_id",
      "invoice_id",
      "pay_url",
      "initiator"
    ])
    .where("initiator", "=", initiator)

  if (ordersStatus) {
    paymentsQuery = paymentsQuery.where("status", "=", ordersStatus)
  }

  const queryData = await paymentsQuery.execute()

  // @ts-expect-error
  const data: PaymentCacheData[] = [...orders, ...queryData]
  return data;
}

const MERCHANT_KEY = Bun.env.HELEKET_MERCHANT_KEY;
const PAYMENT_KEY = Bun.env.HELEKET_PAYMENT_KEY;
const PAYOUT_KEY = Bun.env.HELEKET_PAYOUT_KEY;

const heleket = new Heleket(MERCHANT_KEY, PAYMENT_KEY, PAYOUT_KEY);

export async function createPayment() {
  
}

type TaskItem = {
  type: string,
  value: string
  recipient: string,
}

function createTasksForItem({ recipient, type, value }: TaskItem): TransactionalTask[] {
  const tasks: TransactionalTask[] = [];

  if (type === 'donate') {
    tasks.push(...processDonatePayment({ recipient, type: "donate", value }));
  }

  if (type === 'event') {
    tasks.push({
      name: "notify-player",
      execute: (signal) => callServerCommand(
        { parent: "cmi", value: `toast ${recipient} Поздравляем с покупкой!` }, { signal }
      )
    })
  }

  return tasks;
}

type Item = {
  id: number;
  title: string;
  price: string;
  type: string;
  value: string;
}

type ProcessStoreGamePurchase = {
  items: Array<Item & { currency: GameCurrency }>,
  itemsMap: Map<number, string>
}

type ProcessStoreGamePurchasePayload = {
  data: {
    isSuccess: boolean;
    totalPrice: Record<"CHARISM" | "BELKOIN", number>;
  } | null,
  error: string | null
}

const initialPrices = Object.fromEntries(
  GAME_CURRENCIES.map(currency => [currency, 0])
) as Record<GameCurrency, number>;

export async function processStoreGamePurchase({
  items, itemsMap
}: ProcessStoreGamePurchase): Promise<ProcessStoreGamePurchasePayload> {
  if (!items.length) return { data: null, error: null }

  const finishPrice = items.reduce((acc, item) => {
    const { currency, price } = item;

    if (currency in acc) {
      acc[currency] += parseFloat(price);
    } else {
      acc[currency] = parseFloat(price);
    }

    return acc;
  }, initialPrices);

  async function execute() {
    const globalTasks: TransactionalTask[] = []

    if (finishPrice.BELKOIN > 0) {
      const takeBelkoinTask: TransactionalTask = {
        name: "take-belkoin",
        execute: (signal) => callServerCommand(
          { parent: "p", value: `take ${finishPrice.BELKOIN}` },
          { signal }
        ),
        rollback: (signal) => callServerCommand(
          { parent: "p", value: `give ${finishPrice.BELKOIN}` },
          { signal }
        )
      };

      globalTasks.push(takeBelkoinTask);
    }

    if (finishPrice.CHARISM > 0) {
      const takeCharismTask: TransactionalTask = {
        name: "take-charism",
        execute: (signal) => callServerCommand(
          { parent: "p", value: `take ${finishPrice.CHARISM}` },
          { signal }
        ),
        rollback: (signal) => callServerCommand(
          { parent: "p", value: `give ${finishPrice.CHARISM}` },
          { signal }
        )
      };

      globalTasks.push(takeCharismTask);
    }

    const products = items.map(target => ({
      ...target,
      recipient: itemsMap.get(target.id)!
    }));

    products.forEach(product => {
      const productTasks = createTasksForItem(product);
      globalTasks.push(...productTasks);
    });

    const results = await executeSaga(globalTasks)

    console.log(results)

    return results;
  }

  try {
    const result = await execute()

    if (result.status === 'error') {
      console.error("Game currency purchase failed and was rolled back.", result.error);

      return {
        data: null,
        error: `${result.error instanceof Error ? result.error.message : 'Unknown error'}`
      };
    }

    const data = { isSuccess: result.results.length >= 1, totalPrice: finishPrice }

    return { data, error: null }
  } catch (e) {
    if (e instanceof Error) {
      return { data: null, error: e.message }
    }
  }

  return { data: null, error: null }
}

type ProcessStoreFiatOrCryptoPurchase = {
  itemsMap: Map<number, string>,
  currency: z.infer<typeof paymentCurrencySchema>,
  details: {
    initiator: string
  }
}

type ProcessStoreFiatOrCryptoPurchasePayload = {
  data: {
    url: string,
    orderId: string,
    invoiceId: number,
    totalPrice: number;
    uniqueId: string;
  } | null,
  error: string | null
}

export async function processStoreFiatOrCryptoPurchase({
  itemsMap, currency, details: { initiator }
}: ProcessStoreFiatOrCryptoPurchase): Promise<ProcessStoreFiatOrCryptoPurchasePayload> {
  // @ts-expect-error
  const items = [];
  
  if (!items.length) return { data: null, error: null }

  const { success: isCrypto, data: cryptoCurrency } = currencyCryptoSchema.safeParse(currency);
  const { success: isFiat, data: fiatCurrency } = currencyFiatSchema.safeParse(currency);

  let totalPrice = 0;

  // @ts-expect-error
  for (const product of items) {
    const price = Number(product.price) / 100
    totalPrice += price
  }

  if (isCrypto) {
    // @ts-expect-error
    const products = items.map(target => ({
      ...target,
      recipient: itemsMap.get(target.id)!
    }));

    const payment = await createCryptoOrder({
      products,
      details: {
        totalPrice,
        type: "store",
        asset: cryptoCurrency,
        initiator
      }
    });

    const data = {
      invoiceId: payment.result.invoice_id,
      orderId: payment.result.hash,
      url: payment.result.pay_url,
      uniqueId: payment.result.uniqueId,
      totalPrice
    };

    return { data, error: null }
  }

  if (isFiat && fiatCurrency) {
    // todo: impl fiat processing
    return { data: null, error: "Платежи в фиатной валюте временно недоступны" }
  }

  throw new Error("Некорректная валюта")
}