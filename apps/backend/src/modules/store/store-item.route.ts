import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { StoreItem } from "@repo/shared/types/entities/store";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { definePrice, processImageUrl } from "#/utils/store/store-transforms";
import z from "zod/v4";

async function getItem(id: number): Promise<StoreItem | null> {
  const query = await general
    .selectFrom("store_items")
    .select([
      "id",
      "title",
      "description",
      "price",
      "imageUrl",
      "summary",
      "type",
      "value",
      "currency",
      "command",
    ])
    .where("id", "=", id)
    .executeTakeFirst()

  if (!query) return null;

  const data = {
    ...query,
    imageUrl: processImageUrl(query.imageUrl),
    price: definePrice(query.currency, query.price),
  }

  return data
}

const storeItemSchema = z.object({
  id: z.coerce.number()
})

export const storeItem = new Elysia()
  .get("/item/:id", async (ctx) => {
    const id = ctx.params.id

    const data: StoreItem | null = await getItem(id)

    return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: storeItemSchema
  })