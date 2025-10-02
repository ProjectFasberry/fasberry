import Elysia from "elysia";
import { throwError } from "#/helpers/throw-error";
import { userDerive } from "#/lib/middlewares/user";
import { payments } from "#/shared/database/payments-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CLIENT_ID_HEADER_KEY } from "./payment/create-order.route";
import { getRedisClient } from "#/shared/redis/init";
import { PaymentCacheData } from "./payment/create-crypto-order";
import z from "zod/v4";

const ordersRouteSchema = z.object({
  type: z.enum(["succeeded", "all", "pending"]).optional().default("all")
});

export const ordersRoute = new Elysia()
  .use(userDerive())
  .get("/orders", async (ctx) => {
    const initiator = ctx.nickname ?? ctx.cookie[CLIENT_ID_HEADER_KEY].value as string;

    if (!initiator) {
      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
    }

    const { type } = ctx.query

    try {
      const redis = getRedisClient();

      const keys = await redis.smembers(`index:initiator:${initiator}`);

      const orders: PaymentCacheData[] = await Promise.all(
        keys.map(key => redis.get(key).then(value => JSON.parse(value!)))
      );

      const status = type !== 'all' ? type : null

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

      if (status) {
        query = query.where("status", "=", status)
      } 

      const queryData = await query.execute()

      // @ts-expect-error
      const data: PaymentCacheData[] = [...orders, ...queryData]

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    query: ordersRouteSchema
  })