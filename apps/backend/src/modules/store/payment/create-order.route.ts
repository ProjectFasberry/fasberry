import Elysia from "elysia";
import z from "zod";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { logger } from "#/utils/config/logger";
import type { CreateOrderRoutePayload } from "@repo/shared/types/entities/payment"
import { isProduction } from "#/shared/env";
import { defineInitiator } from "#/lib/middlewares/define";
import { throwError } from "#/helpers/throw-error";
import { getCartSelectedItems } from "../cart.model";
import { processStoreGamePurchase } from "./order.model";
import { defineGlobalPrice } from "#/utils/store/store-transforms";
import { getBalance } from "#/modules/user/balance.route";
import { nanoid } from "nanoid";

const createOrderTopUpSchema = z.object({
  currency: z.string()
})

export const createOrderTopUp = new Elysia()
  .use(defineInitiator())
  .post("/top-up", async ({ status, body }) => {
    const { } = body;

    const data = null;

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: createOrderTopUpSchema
  })

const ERRORS_MAP: Record<string, string> = {
  "TIMEOUT": "Похоже игровой сервер не доступен"
}

export const createOrder = new Elysia()
  .use(defineInitiator())
  .post('/create', async ({ initiator, status }) => {
    if (!isProduction) logger.debug(`Initiator ${initiator}`)

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

      const { totalPrice } = result.data;
      const uniqueId = nanoid(9);

      const price = {
        BELKOIN: Number(totalPrice.BELKOIN ?? 0),
        CHARISM: Number(totalPrice.CHARISM ?? 0),
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