import { executeSaga, TransactionalTask } from "#/utils/config/saga";
import { callServerCommand } from "#/utils/server/call-command";
import { GAME_CURRENCIES, GameCurrency } from "@repo/shared/schemas/payment";
import { getOrderKey, PaymentCacheData } from "./create-crypto-order";
import { processDonatePayment } from "#/utils/payment/process-donate-payment";
import { payments } from "#/shared/database/payments-db";
import { getRedis } from "#/shared/redis/init";
import z from "zod";
import { safeJsonParse } from "#/utils/config/transforms";

export async function getOrder(uniqueId: string): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
  async function getCachedOrder(): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
    const redis = getRedis()
    const key = getOrderKey(uniqueId)

    const dataStr = await redis.get(key)
    if (!dataStr) return null;

    const result = safeJsonParse<PaymentCacheData>(dataStr);
    if (!result.ok) return null;

    const data = result.value
    return data
  }

  async function getPersistedOrder(): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
    const query = await payments
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
        "initiator",
        "comment"
      ])
      .where("unique_id", "=", uniqueId)
      .executeTakeFirst()

    if (!query) return null;

    const data = {
      ...query,
      asset: query.asset as Omit<PaymentCacheData, "expires_in">["asset"]
    }

    return data
  }

  const cache = await getCachedOrder();
  if (cache) return cache;

  const data = await getPersistedOrder();
  return data
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