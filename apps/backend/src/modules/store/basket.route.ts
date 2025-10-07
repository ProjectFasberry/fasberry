import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { general } from "#/shared/database/main-db";
import { defineGlobalPrice, definePrice, processImageUrl, StorePrice } from "#/utils/store/store-transforms";
import z from "zod";
import { defineInitiator } from "#/lib/middlewares/define";

const itemBasketBaseSchema = z.object({
  id: z.coerce.number()
})

const editItemKeys = ["for", "selected"] as const;
const editItemValues = [z.string(), z.boolean()];

const editItemToBasket = z.object({
  id: z.coerce.number(),
  key: z.enum(editItemKeys),
  value: z.union(editItemValues)
})

const addItemToBasket = new Elysia()
  .use(defineInitiator())
  .post("/add", async ({ status, initiator, body }) => {
    const { id } = body;

    const existsQuery = await general
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
      throw new Error("Item not found")
    }

    const query = await general
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

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: itemBasketBaseSchema
  })

const removeItemToBasket = new Elysia()
  .use(defineInitiator())
  .delete("/remove", async ({ initiator, cookie, status, body }) => {
    const { id } = body;

    const query = await general
      .deleteFrom("store_cart_items")
      .where("product_id", "=", id)
      .where("initiator", "=", initiator)
      .returning("id")
      .executeTakeFirst()

    const data = Boolean(query?.id)

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: itemBasketBaseSchema
  })

const itemEdit = new Elysia()
  .use(defineInitiator())
  .post("/edit", async ({ initiator, status, body }) => {
    const { id, ...target } = body;

    const query = await general
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

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: editItemToBasket
  })

async function getBasketData(initiator: string) {
  const query = await general
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

  return query
}

const basketList = new Elysia()
  .use(defineInitiator())
  .get("/list", async ({ status, initiator }) => {
    const query = await getBasketData(initiator)

    const products = query.map((item) => ({
      ...item,
      imageUrl: processImageUrl(item.imageUrl),
      price: definePrice(item.currency, item.price)
    }))

    const price = await defineGlobalPrice("RUB", initiator)

    const data: { products: typeof products, price: StorePrice } = { products, price }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const basket = new Elysia()
  .group("/basket", app => app
    .use(basketList)
    .use(addItemToBasket)
    .use(removeItemToBasket)
    .use(itemEdit)
  )