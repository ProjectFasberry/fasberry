import Elysia from "elysia";
import { orderRoute } from "./order.route";
import { orderEvents } from "./order-events.route";
import { createOrder, createOrderTopUp } from "./create-order.route";
import { ordersList } from "./orders-list.route";

export const order = new Elysia()
  .group("/order", app => app
    .use(orderRoute)
    .use(orderEvents)
    .use(createOrderTopUp)
    .use(createOrder)
    .use(ordersList)
  )