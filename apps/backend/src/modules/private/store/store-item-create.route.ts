import Elysia from "elysia";
import { z } from "zod"
import { general } from "#/shared/database/main-db";
import { GAME_CURRENCIES } from "@repo/shared/schemas/payment";
import { HttpStatusEnum } from "elysia-http-status-code/status";

async function createStoreItem(
  { title, description, summary, price, currency, imageUrl, type, value, command }: z.infer<typeof storeItemCreateSchema>
) {
  const query = await general
    .insertInto("store_items")
    .values({
      title,
      description,
      summary,
      price,
      currency,
      imageUrl,
      type,
      value,
      command
    })
    .executeTakeFirst()

  return query;
}

const storeItemCreateSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  summary: z.string(),
  price: z.string(),
  currency: z.enum(GAME_CURRENCIES),
  imageUrl: z.string(),
  type: z.string(),
  value: z.string(),
  command: z.string()
})

export const storeItemCreate = new Elysia()
  .post("/create", async ({ body, status }) => {
    const data = await createStoreItem(body)

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: storeItemCreateSchema
  })