import { defineInitiator } from "#/lib/middlewares/define"
import Elysia from "elysia"
import { getOrders, ordersRouteSchema } from "./order.model"

export const ordersList = new Elysia()
  .use(defineInitiator())
  .get("/list", async ({ initiator, query }) => {
    const data = await getOrders(query, initiator)
    return { data }
  }, {
    query: ordersRouteSchema
  })