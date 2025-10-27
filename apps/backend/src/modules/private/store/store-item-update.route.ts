import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";
import { JsonValue } from "@repo/shared/types/db/auth-database-types";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";

async function editStoreItem(id: number, opts: z.infer<typeof storeItemEditSchema>) {
  const query = await general
    .updateTable("store_items")
    .set({
      [opts.key]: opts.value
    })
    .where('id', "=", id)
    .returning([opts.key])
    .executeTakeFirstOrThrow()

  return query;
}

const EDITABLE_FIELDS = ["description", "summary", "title", "content", "imageUrl", "value", "command", "type"] as const;

const storeItemEditSchema = z.object({
  key: z.enum(EDITABLE_FIELDS),
  value: z.string()
    .or(z.coerce.boolean())
    .or(z.object({}).loose().transform((v) => v as JsonValue))
})

const storeItemEditFields = new Elysia()
  .use(validatePermission(PERMISSIONS.STORE.ITEM.UPDATE))
  .get("/fields", async (ctx) => {
    return { data: EDITABLE_FIELDS }
  })

const storeItemEdit = new Elysia()
  .use(validatePermission(PERMISSIONS.STORE.ITEM.UPDATE))
  .post("/:id", async ({ nickname, params, body }) => {
    const id = params.id;
    const data = await editStoreItem(id, body);

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.STORE.ITEM.UPDATE })

    return { data }
  }, {
    params: z.object({
      id: z.coerce.number()
    }),
    body: storeItemEditSchema
  })

export const storeItemEditGroup = new Elysia()
  .group("/edit", app => app
    .use(storeItemEditFields)
    .use(storeItemEdit)
  )