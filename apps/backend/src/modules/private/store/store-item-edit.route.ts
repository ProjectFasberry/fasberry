import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";
import { StoreItems } from "@repo/shared/types/db/auth-database-types";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";
import { EDITABLE_FIELDS, storeItemEditSchema } from "@repo/shared/schemas/store";
import { Selectable } from "kysely";
import { buildUpdates } from "#/utils/config/transforms";

const PERMISSION = PERMISSIONS.STORE.ITEM.UPDATE

async function editStoreItem(id: number, values: z.infer<typeof storeItemEditSchema>) {
  const updates = buildUpdates<Selectable<StoreItems>>(values)

  const fields = values.map((o) => o.field)

  const query = await general
    .updateTable("store_items")
    .set(updates)
    .where('id', "=", id)
    .returning(fields)
    .executeTakeFirstOrThrow()

  return query;
}

const storeItemEdit = new Elysia()
  .use(validatePermission(PERMISSION))
  .post("/:id/edit", async ({ params, body }) => {
    const id = params.id;
    const data = await editStoreItem(id, body);
    return { data }
  }, {
    params: z.object({ id: z.coerce.number() }),
    body: storeItemEditSchema,
    afterResponse: ({ permission, nickname: initiator }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })

const storeItemEditFields = new Elysia()
  .use(validatePermission(PERMISSIONS.STORE.ITEM.UPDATE))
  .get("/editable-fields", async () => ({ data: EDITABLE_FIELDS }))

export const storeItemEditGroup = new Elysia()
  .group("", app => app
    .use(storeItemEditFields)
    .use(storeItemEdit)
  )