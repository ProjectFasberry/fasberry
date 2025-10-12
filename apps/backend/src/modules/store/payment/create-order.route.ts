import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import type { CreateOrderRoutePayload } from "@repo/shared/types/entities/payment"
import { defineInitiator } from "#/lib/middlewares/define";
import { throwError } from "#/helpers/throw-error";
import { getCartSelectedItems } from "../cart.model";
import { processStoreGamePurchase } from "./order.model";
import { defineGlobalPrice } from "#/utils/store/store-transforms";
import { getBalance } from "#/modules/user/balance.route";
import { nanoid } from "nanoid";
import { GameCurrency } from "@repo/shared/schemas/payment";

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
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("insufficient"))
    }

    const items = await getCartSelectedItems(initiator);

    if (items.length === 0) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("items-not-found"))
    }

    const itemsMap = new Map(items.map(item => [item.id, item.recipient]));

    try {
      const result = await processStoreGamePurchase({ items, itemsMap });

      if (!result.data) {
        throw status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, result.error)
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

      return status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      if (e instanceof Error) {
        const message = ERRORS_MAP[e.message] ?? e.message
        return status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(message))
      }

      throw status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
    }
  })