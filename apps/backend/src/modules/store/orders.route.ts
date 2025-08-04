import Elysia from "elysia";
import { throwError } from "#/helpers/throw-error";
import { userDerive } from "#/lib/middlewares/user";
import { payments } from "#/shared/database/payments-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CLIENT_ID_HEADER_KEY } from "./payment/create-order.route";
import { getRedisClient } from "#/shared/redis/init";
import { PaymentCacheData } from "./payment/create-crypto-order";

export const ordersRoute = new Elysia()
  .use(userDerive())
  .get("/orders", async (ctx) => {
    const initiator = ctx.nickname ?? ctx.cookie[CLIENT_ID_HEADER_KEY].value;

    if (!initiator) {
      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
    }

    try {
      const redis = getRedisClient();

      const keys = await redis.smembers(`index:initiator:${initiator}`);
      const orders: PaymentCacheData[] = await Promise.all(
        keys.map(key => redis.get(key).then(value => JSON.parse(value!)))
      );

      const query = await payments
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
        .execute()

      // @ts-expect-error
      const data: PaymentCacheData[] = [...orders, ...query]

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })