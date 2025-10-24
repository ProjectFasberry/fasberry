import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import type { CreateOrderRoutePayload } from "@repo/shared/types/entities/payment"
import { defineInitiator } from "#/lib/middlewares/define";
import { wrapError } from "#/helpers/wrap-error";
import { getCartSelectedItems } from "../cart/cart.model";
import { processStoreGamePurchase } from "./order.model";
import { defineGlobalPrice } from "#/utils/store/store-transforms";
import { nanoid } from "nanoid";
import { GameCurrency } from "@repo/shared/schemas/payment";
import { withError } from "#/shared/schemas";
import { getBalance } from "#/modules/user/balance.model";

const ERRORS_MAP: Record<string, string> = {
  "TIMEOUT": "Похоже игровой сервер не доступен"
}

export const createOrder = new Elysia()
  .use(defineInitiator())
  .post('/create', async ({ initiator, status }) => {
    const [balance, finalPrice] = await Promise.all([
      getBalance(initiator),
      defineGlobalPrice(initiator)
    ])

    if (
      balance.BELKOIN < finalPrice.BELKOIN
      || balance.CHARISM < finalPrice.CHARISM
    ) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("insufficient"))
    }

    const items = await getCartSelectedItems(initiator);

    if (items.length === 0) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("items-not-found"))
    }

    const itemsMap = new Map(items.map(item => [item.id, item.recipient]));

    try {
      const result = await processStoreGamePurchase({ items, itemsMap });

      if (!result.data) {
        return status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, wrapError(result.error))
      }

      const uniqueId = nanoid(9);
      const { BELKOIN, CHARISM } = result.data.totalPrice;

      const price: Record<GameCurrency, number> = {
        BELKOIN: Number(BELKOIN ?? 0),
        CHARISM: Number(CHARISM ?? 0),
      }

      const data: CreateOrderRoutePayload = {
        purchase: { uniqueId },
        payload: { price }
      };

      return { data }
    } catch (e) {
      if (e instanceof Error) {
        const message = ERRORS_MAP[e.message] ?? e.message
        return status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, wrapError(message))
      }

      throw e
    }
  }, {
    response: {
      500: withError,
      400: withError,
    }
  })