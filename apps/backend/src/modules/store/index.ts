import Elysia from "elysia";
import { storeItem } from "./items/store-item.route";
import { storeItems } from "./items/store-items.route";
import { currencies } from "./order/currencies.route";
import { cart } from "./cart/cart.route";
import { processPlayerVote } from "../server/votes/process-vote.route";
import { checkOrderRoute } from "./order/check-order.route";
import { defineClientId } from "#/lib/middlewares/define";
import { order } from "./order";
import { exchangeRates } from "./exchange-rates";
import { paymentMethods } from "./order/order-methods.route";

export const store = new Elysia()
  .use(defineClientId())
  .group("/store", app => app
    .group("/hooks", app => app
      .use(processPlayerVote)
      .use(checkOrderRoute)
    )
    .use(storeItem)
    .use(storeItems)
    .use(order)
    .use(paymentMethods)
    .use(currencies)
    .use(cart)
    .use(exchangeRates)
  )