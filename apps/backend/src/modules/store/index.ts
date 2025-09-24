import Elysia from "elysia";
import { orderRoute } from "./order.route";
import { paymentEvents } from "./payment/payment-events.route";
import { storeItem } from "./store-item.route";
import { storeItems } from "./store-items.route";
import { createOrderRoute } from "./payment/create-order.route";
import { currencies } from "./payment/currencies.route";
import { ordersRoute } from "./orders.route";
import { basket } from "./basket.route";
import { processPlayerVote } from "../server/process-vote.route";
import { checkOrderRoute } from "./payment/check-order.route";
import { defineClientId } from "#/utils/auth/session";

export const store = new Elysia()
  .derive(({ cookie }) => {
    defineClientId(cookie);
  })
  .group("/store",
    (app) => app
      .group("/order",
        app => app
          .use(orderRoute)
          .use(paymentEvents)
      )
      .group("/hooks", app => app
        .use(processPlayerVote)
        .use(checkOrderRoute)
      )
      .use(storeItem)
      .use(storeItems)
      .use(createOrderRoute)
      .use(currencies)
      .use(ordersRoute)
      .use(basket)
  )