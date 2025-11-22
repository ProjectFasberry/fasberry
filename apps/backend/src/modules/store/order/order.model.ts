import { executeSaga, TransactionalTask } from "#/utils/config/saga";
import { callServerCommand } from "#/utils/server/call-command";
import { GAME_CURRENCIES, GameCurrency } from "@repo/shared/schemas/payment";
import { getOrderKey, PaymentCacheData } from "./create-crypto-order";
import { processDonatePayment } from "#/utils/payment/process-donate-payment";
import { payments } from "#/shared/database/payments-db";
import { getRedis } from "#/shared/redis/init";
import z from "zod";
import { nanoid } from "nanoid"
import { safeJsonParse } from "#/utils/config/transforms";
import { StoreCurrency } from "@repo/shared/types/db/auth-database-types";

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

export const initialPrices = Object.fromEntries(
  GAME_CURRENCIES.map(currency => [currency, 0])
) as Record<GameCurrency, number>;

export async function createGamePaymentRecord(
  uniqueId: string,
  initiator: string,
  products: {
    recipient: string;
    id: number;
    title: string;
    price: string;
    type: string;
    value: string;
    currency: GameCurrency;
  }[],
) {
  const ids: number[] = []

  const query = await payments.transaction().execute(async (trx) => {
    for (const { recipient, id: store_item_id } of products) {
      const { id } = await trx
        .insertInto("payments_game_childs")
        .values({ recipient, store_item_id, })
        .returningAll()
        .executeTakeFirstOrThrow();
  
      ids.push(id)
    }
  
    const payloadOrderItemIds = ids.map((item_id) => ({
      unique_id: uniqueId, initiator, item_id
    }))
  
    await trx
      .insertInto("payments_game")
      .values(payloadOrderItemIds)
      .executeTakeFirstOrThrow()
  })

  return query;
}

export async function updateGamePaymentRecord(uniqueId: string) {
  const query = await payments
    .updateTable("payments_game")
    .set({ finished_at: new Date().toISOString() })
    .where("unique_id", "=", uniqueId)
    .executeTakeFirstOrThrow();

  return query;
}

export async function processStoreGamePurchase(
  initiator: string,
  finishPrice: typeof initialPrices,
  products: {
    recipient: string;
    id: number;
    price: string;
    type: string;
    value: string;
    currency: StoreCurrency;
    title: string;
  }[]
) {
  try {
    async function execute() {
      const globalTasks: TransactionalTask[] = []

      const { BELKOIN, CHARISM } = finishPrice

      if (BELKOIN > 0) {
        const takeBelkoinTask: TransactionalTask = {
          name: "take-belkoin",
          execute: (signal) => callServerCommand(
            { parent: "p", value: `take ${initiator} ${BELKOIN}` },
            { signal }
          ),
          rollback: (signal) => callServerCommand(
            { parent: "p", value: `give ${initiator} ${BELKOIN}` },
            { signal }
          )
        };

        globalTasks.push(takeBelkoinTask);
      }

      if (CHARISM > 0) {
        const takeCharismTask: TransactionalTask = {
          name: "take-charism",
          execute: (signal) => callServerCommand(
            { parent: "cmi", value: `money take ${initiator} ${CHARISM}` },
            { signal }
          ),
          rollback: (signal) => callServerCommand(
            { parent: "cmi", value: `money give ${initiator} ${CHARISM} ` },
            { signal }
          )
        };

        globalTasks.push(takeCharismTask);
      }

      products.forEach(product => {
        const productTasks = createTasksForItem(product);
        globalTasks.push(...productTasks);
      });

      const results = await executeSaga(globalTasks)
      return results;
    }

    const result = await execute()
    console.log(result);

    if (result.status === 'error') {
      const error = `${result.error instanceof Error ? result.error.message : 'Unknown error'}`
      return { data: null, error };
    }

    return { result }
  } catch (e) {
    throw e
  }
}