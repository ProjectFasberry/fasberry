import Elysia from "elysia";
import { storeItem } from "./store-item.route";
import { storeItems } from "./store-items.route";
import { currencies } from "./payment/currencies.route";
import { cart } from "./cart.route";
import { processPlayerVote } from "../server/process-vote.route";
import { checkOrderRoute } from "./payment/check-order.route";
import { defineClientId } from "#/lib/middlewares/define";
import { order } from "./payment";
import { exchangeRates } from "./exchange-rates";
import { paymentMethods } from "./payment-methods";

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