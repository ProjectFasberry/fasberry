import { defineInitiator } from "#/lib/middlewares/define"
import Elysia from "elysia"
import { getOrders, ordersRouteSchema } from "./order.model"
import { HttpStatusEnum } from "elysia-http-status-code/status"

export const ordersList = new Elysia()
  .use(defineInitiator())
  .get("/list", async ({ initiator, status, query }) => {
    const data = await getOrders(query, initiator)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: ordersRouteSchema
  })