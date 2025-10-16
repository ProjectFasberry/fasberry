import Elysia, { t } from "elysia";
import z from "zod";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineGlobalPrice } from "#/utils/store/store-transforms";
import { defineInitiator } from "#/lib/middlewares/define";
import { CartPayload } from "@repo/shared/types/entities/store";
import { addItemToBasket, editItemInCart, editItemToBasket, getBasketData, removeItemFromCart, validateInitiatorExists } from "./cart.model";
import { wrapError } from "#/helpers/wrap-error";
import { withData } from "#/shared/schemas";

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
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("Recipient not found"))
    }

    const data = await addItemToBasket(id, { initiator, recipient });
    return { data }
  }, {
    body: itemBasketAddSchema
  })

const basketRemoveItem = new Elysia()
  .use(defineInitiator())
  .delete("/remove", async ({ initiator, body }) => {
    const { id } = body;
    const data = await removeItemFromCart(id, initiator)
    return { data }
  }, {
    body: itemBasketBaseSchema
  })

const basketEditItem = new Elysia()
  .use(defineInitiator())
  .post("/edit", async ({ initiator, body }) => {
    const data = await editItemInCart(body, initiator)
    return { data }
  }, {
    body: editItemToBasket
  })

const cartListPayload = t.Object({
  imageUrl: t.String(),
  price: t.Number(),
  recipient: t.String(),
  selected: t.Boolean(),
  quantity: t.Number(),
  id: t.Number(),
  value: t.String(),
  type: t.String(),
  command: t.Nullable(t.String()),
  currency: t.String(),
  description: t.Object(t.Unknown()),
  summary: t.String(),
  title: t.String(),
})

const cartPricePayload = t.Object({
  CHARISM: t.Number(),
  BELKOIN: t.Number()
})

const basketList = new Elysia()
  .use(defineInitiator())
  .model({
    "cart-list": withData(
      t.Object({
        products: t.Array(cartListPayload),
        price: cartPricePayload
      })
    )
  })
  .get("/list", async ({ initiator }) => {
    const [products, price] = await Promise.all([
      getBasketData(initiator),
      defineGlobalPrice(initiator)
    ])

    const data: CartPayload = { products, price }

    return { data }
  }, {
    response: {
      200: "cart-list"
    }
  })

export const cart = new Elysia()
  .group("/cart", app => app
    .use(basketList)
    .use(basketAddItem)
    .use(basketRemoveItem)
    .use(basketEditItem)
  )