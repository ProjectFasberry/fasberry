import Elysia from "elysia";
import { z } from "zod"
import { general } from "#/shared/database/main-db";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";
import { storeItemCreateSchema } from "@repo/shared/schemas/store";

async function createStoreItem(values: z.infer<typeof storeItemCreateSchema>) {
  const query = await general
    .insertInto("store_items")
    .values(values)
    .returningAll()
    .executeTakeFirst()

  return query;
}

export const storeItemCreate = new Elysia()
  .use(validatePermission(PERMISSIONS.STORE.ITEM.CREATE))
  .post("/create", async ({ body }) => {
    const data = await createStoreItem(body)
    return { data }
  }, {
    body: storeItemCreateSchema,
    afterResponse: ({ permission, nickname: initiator }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })