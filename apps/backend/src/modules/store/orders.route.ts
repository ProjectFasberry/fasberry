import { throwError } from "#/helpers/throw-error";
import { userDerive } from "#/lib/middlewares/user";
import { payments } from "#/shared/database/payments-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CLIENT_ID_HEADER_KEY } from "./payment/create-order.route";
import { getRedisClient } from "#/shared/redis/init";

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
      const orders = await Promise.all(
        keys.map((key) => redis.get(key).then((v) => JSON.parse(v!)))
      );

      const query = await payments
        .selectFrom("payments")
        .selectAll()
        .where("initiator", "=", initiator)
        .execute()

      const data = [...orders, ...query]
      
      console.log(data)
      
      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })