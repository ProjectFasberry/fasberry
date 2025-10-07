import Elysia from "elysia";
import { payments } from "#/shared/database/payments-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getRedis } from "#/shared/redis/init";
import { PaymentCacheData } from "./payment/create-crypto-order";
import z from "zod";
import { defineInitiator } from "#/lib/middlewares/define";

const ordersRouteSchema = z.object({
  type: z.enum(["succeeded", "all", "pending"]).optional().default("all")
});

export const ordersRoute = new Elysia()
  .use(defineInitiator())
  .get("/orders", async ({ initiator, status, ...ctx }) => {
    const { type } = ctx.query

    const redis = getRedis();

    const keys = await redis.smembers(`index:initiator:${initiator}`);

    const orders: PaymentCacheData[] = await Promise.all(
      keys.map(key => redis.get(key).then(value => JSON.parse(value!)))
    );

    const ordersStatus = type !== 'all' ? type : null

    let query = payments
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
      query = query.where("status", "=", ordersStatus)
    }

    const queryData = await query.execute()

    // @ts-expect-error
    const data: PaymentCacheData[] = [...orders, ...queryData]

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: ordersRouteSchema
  })