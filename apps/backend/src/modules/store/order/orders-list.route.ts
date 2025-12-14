import Elysia from "elysia"
import { getOrders } from "./order.model"
import { ordersRouteSchema } from "@repo/shared/schemas/store"
import { defineUser } from "#/lib/middlewares/define"

export const ordersList = new Elysia()
  .use(defineUser())
  .get("/list", async ({ nickname: initiator, query }) => {
    const data = await getOrders(initiator, query)
    return { data }
  }, {
    query: ordersRouteSchema
  })