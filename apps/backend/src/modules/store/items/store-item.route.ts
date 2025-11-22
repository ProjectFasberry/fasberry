import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { StoreItem } from "@repo/shared/types/entities/store";
import { definePrice, processImageUrl } from "#/utils/store/store-transforms";
import z from "zod";

async function getItem(id: number): Promise<StoreItem | null> {
  const query = await general
    .selectFrom("store_items")
    .select([
      "id",
      "title",
      "description",
      "price",
      "imageUrl",
      "type",
      "value",
      "currency",
      "command",
      "content"
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

export const storeItem = new Elysia()
  .get("/item/:id", async ({ params }) => {
    const id = params.id
    const data: StoreItem | null = await getItem(id)
    return { data }
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })