import Elysia from "elysia";
import { z } from "zod"
import { general } from "#/shared/database/main-db";
import { GAME_CURRENCIES } from "@repo/shared/schemas/payment";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";

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
  .use(validatePermission(PERMISSIONS.STORE.ITEM.CREATE))
  .post("/create", async ({ nickname, body }) => {
    const data = await createStoreItem(body)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.STORE.ITEM.CREATE })

    return { data }
  }, {
    body: storeItemCreateSchema
  })