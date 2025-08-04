import Elysia, { t } from "elysia";
import { userDerive } from "#/lib/middlewares/user";
import { CLIENT_ID_HEADER_KEY } from "./payment/create-order.route";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { main } from "#/shared/database/main-db";
import { defineGlobalPrice, definePrice, processImageUrl, StorePrice } from "#/utils/store/store-transforms";

const itemBasketBaseSchema = t.Object({
  id: t.Number()
})

const editItemKeys = ["for", "selected"] as const;
const editItemValues = [t.String(), t.Boolean()];

const editItemToBasket = t.Object({
  id: t.Number(),
  key: t.UnionEnum(editItemKeys),
  value: t.Union(editItemValues)
})

const addItemToBasket = new Elysia()
  .use(userDerive())
  .post("/add", async (ctx) => {
    const initiator = ctx.nickname ?? ctx.cookie[CLIENT_ID_HEADER_KEY].value;

    const { id } = ctx.body;

    try {
      if (!initiator) {
        throw new Error()
      }

      const existsQuery = await main
        .selectFrom("store_items")
        .select(eb => [
          "store_items.id",
          "store_items.price",
          eb.fn.countAll("store_items").as("count")
        ])
        .where("id", "=", id)
        .groupBy([
          "store_items.id",
          "store_items.price",
        ])
        .executeTakeFirst()

      if (!existsQuery?.count) {
        throw new Error("Товара нет в наличии")
      }

      const query = await main
        .insertInto("store_cart_items")
        .values({
          initiator,
          price_snapshot: existsQuery.price.toString(),
          product_id: existsQuery.id,
          quantity: 1,
          for: initiator
        })
        .returning("product_id")
        .executeTakeFirst()

      const data = Boolean(query?.product_id)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    body: itemBasketBaseSchema
  })

const removeItemToBasket = new Elysia()
  .use(userDerive())
  .delete("/remove", async (ctx) => {
    const initiator = ctx.nickname ?? ctx.cookie[CLIENT_ID_HEADER_KEY].value;

    const { id } = ctx.body;

    try {
      if (!initiator) {
        throw new Error()
      }

      const query = await main
        .deleteFrom("store_cart_items")
        .where("product_id", "=", id)
        .where("initiator", "=", initiator)
        .returning("id")
        .executeTakeFirst()

      const data = Boolean(query?.id)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    body: itemBasketBaseSchema
  })

const itemEdit = new Elysia()
  .use(userDerive())
  .post("/edit", async (ctx) => {
    const initiator = ctx.nickname ?? ctx.cookie[CLIENT_ID_HEADER_KEY].value

    const { id, ...target } = ctx.body;

    try {
      if (!initiator) {
        throw new Error()
      }

      const query = await main
        .updateTable("store_cart_items")
        .set({
          [target.key]: target.value
        })
        .where("product_id", "=", id)
        .where("initiator", "=", initiator)
        .returning(target.key)
        .executeTakeFirst()

      if (!query) {
        throw new Error()
      }

      const data = query[target.key]

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    body: editItemToBasket
  })

const basketList = new Elysia()
  .use(userDerive())
  .get("/list", async (ctx) => {
    const initiator = ctx.nickname ?? ctx.cookie[CLIENT_ID_HEADER_KEY].value

    try {
      if (!initiator) {
        throw new Error()
      }

      const query = await main
        .selectFrom("store_cart_items")
        .innerJoin("store_items", "store_items.id", "store_cart_items.product_id")
        .select([
          "store_items.id",
          "store_items.title",
          "store_items.description",
          "store_items.summary",
          "store_items.command",
          "store_items.currency",
          "store_items.type",
          "store_items.imageUrl",
          "store_items.value",
          "store_items.price",
          "store_cart_items.selected",
          "store_cart_items.for",
          "store_cart_items.quantity",
        ])
        .where("initiator", "=", initiator)
        .groupBy([
          "store_items.id",
          "store_items.title",
          "store_items.description",
          "store_items.summary",
          "store_items.command",
          "store_items.currency",
          "store_items.type",
          "store_items.imageUrl",
          "store_items.value",
          "store_items.price",
          "store_cart_items.selected",
          "store_cart_items.for",
          "store_cart_items.quantity",
        ])
        .execute()

      const products = query.map((item) => ({
        ...item,
        imageUrl: processImageUrl(item.imageUrl),
        price: definePrice(item.currency, item.price)
      }))

      const price = await defineGlobalPrice("RUB", initiator)

      const data: { products: typeof products, price: StorePrice } = { products, price }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

export const basket = new Elysia()
  .group("/basket", app => app
    .use(basketList)
    .use(addItemToBasket)
    .use(removeItemToBasket)
    .use(itemEdit)
  )