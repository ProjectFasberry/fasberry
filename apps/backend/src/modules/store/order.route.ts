import { throwError } from "#/helpers/throw-error";
import { payments } from "#/shared/database/payments-db";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getOrderKey, PaymentCacheData, } from "./payment/create-crypto-order";
import { getRedisClient } from "#/shared/redis/init";

async function getCachedOrder(uniqueId: string): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
  const redis = getRedisClient()
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
    return { ...dbResult, asset: dbResult.asset as Omit<PaymentCacheData, "expires_in">["asset"] }
  }

  return null;
}

export async function getOrder(uniqueId: string): Promise<Omit<PaymentCacheData, "expires_in"> | null> {
  const cached = await getCachedOrder(uniqueId);
  if (cached) return cached;

  const persisted = await getPersistedOrder(uniqueId);
  return persisted
}

const orderRouteSchema = t.Object({
  id: t.String()
})

const statusMap: Record<string, "success" | "pending" | "canceled" | "error"> = {
  "succeeded": "success",
  "failed": "error",
  "captured": "pending",
  "pending": "pending",
  "waitingForCapture": "pending",
  "canceled": "canceled",
  "received": "success",
  "created": "pending",
  "cancelled": "canceled",
}

//     async function getCurrencyPriceByRub<T extends CurrencyString>(
//       convertedCurrency: T
//     ): Promise<{ [key in T]: { rub: number } }> {
//       // @ts-expect-error
//       const currencyId = PAYMENT_CURRENCIES_MAPPING[convertedCurrency]

//       const res = await ky("https://api.coingecko.com/api/v3/simple/price", {
//         searchParams: { "ids": currencyId, "vs_currencies": "rub" }
//       })

//       const data = await res.json<{ [key in T]: { rub: number } }>()

//       return data;
//     }

//     const res = await getCurrencyPriceByRub(currency)

//     if (Object.keys(res).length === 0) return null;

//     return res
//   })

export const orderRoute = new Elysia()
  .get("/:id", async (ctx) => {
    const id = ctx.params.id;

    try {
      const data = await getOrder(id)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    params: orderRouteSchema
  })