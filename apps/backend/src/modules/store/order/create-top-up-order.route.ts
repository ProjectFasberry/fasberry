import Elysia, { t } from "elysia";
import { defineInitiator } from "#/lib/middlewares/define";
import { processStoreCryptoPurchaseCryptobot } from "./cryptobot/cryptobot.model";
import { processStoreCryptoPurchaseHeleket } from "./heleket/heleket.model";
import { createOrderTopUpSchema, MethodType, OrderInputPayload, OutputPayload } from "@repo/shared/schemas/payment";
import { general } from "#/shared/database/main-db";
import { withData } from "#/shared/schemas";

async function validateMethodAvailable(method: string) {
  const query = await general
    .selectFrom("payment_methods")
    .select("id")
    .where("isAvailable", "=", true)
    .where("value", "=", method)
    .executeTakeFirst()

  return Boolean(query)
}

const targets: Record<MethodType, (pd: OrderInputPayload) => Promise<OutputPayload>> = {
  "cryptobot": async (payload) => {
    return processStoreCryptoPurchaseCryptobot(payload)
  },
  "heleket": async (payload) => {
    throw new Error("Некорректный способ оплаты. Heleket пока не доступен")
  },
  "sbp": async (payload) => {
    throw new Error("Некорректный способ оплаты. SBP пока не доступен")
  },
}

export const createOrderTopUp = new Elysia()
  .use(defineInitiator())
  .model({
    "top-up": withData(
      t.Object({
        url: t.String(),
        orderId: t.String(),
        invoiceId: t.Number(),
        totalPrice: t.Number(),
        uniqueId: t.String(),
      })
    )
  })
  .post("/top-up", async ({ initiator, body }) => {
    const { target, method, comment, value, recipient } = body;

    const event = targets[method.type];

    const isValid = await validateMethodAvailable(method.type);
    if (!isValid) {
      throw new Error(`Некорректный способ оплаты. Этот способ пока не доступен`);
    }

    const data: OutputPayload = await event({ target, method, value, comment, recipient, initiator });

    return { data }
  }, {
    body: createOrderTopUpSchema,
    response: {
      200: "top-up"
    }
  })