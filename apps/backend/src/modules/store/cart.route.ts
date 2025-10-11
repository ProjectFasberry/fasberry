import Elysia from "elysia";
import z from "zod";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineGlobalPrice } from "#/utils/store/store-transforms";
import { defineInitiator } from "#/lib/middlewares/define";
import { CartPayload } from "@repo/shared/types/entities/store";
import { addItemToBasket, editItemInCart, editItemToBasket, getBasketData, removeItemFromCart, validateInitiatorExists } from "./cart.model";
import { throwError } from "#/helpers/throw-error";

const itemBasketBaseSchema = z.object({
  id: z.coerce.number(),
})

const itemBasketAddSchema = z.intersection(
  itemBasketBaseSchema,
  z.object({
    recipient: z.string().min(1)
  })
)

const basketAddItem = new Elysia()
  .use(defineInitiator())
  .post("/add", async ({ status, initiator, body }) => {
    const { id, recipient } = body;
    const validateResult = await validateInitiatorExists(recipient)

    if (!validateResult) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Recipient not found"))
    }

    const data = await addItemToBasket(id, { initiator, recipient });
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: itemBasketAddSchema
  })

const basketRemoveItem = new Elysia()
  .use(defineInitiator())
  .delete("/remove", async ({ initiator, status, body }) => {
    const { id } = body;
    const data = await removeItemFromCart(id, initiator)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: itemBasketBaseSchema
  })

const basketEditItem = new Elysia()
  .use(defineInitiator())
  .post("/edit", async ({ initiator, status, body }) => {
    const data = await editItemInCart(body, initiator)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: editItemToBasket
  })

const basketList = new Elysia()
  .use(defineInitiator())
  .get("/list", async ({ status, initiator }) => {
    const [products, price] = await Promise.all([
      getBasketData(initiator),
      defineGlobalPrice(initiator)
    ])

    const data: CartPayload = { products, price }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const cart = new Elysia()
  .group("/cart", app => app
    .use(basketList)
    .use(basketAddItem)
    .use(basketRemoveItem)
    .use(basketEditItem)
  )