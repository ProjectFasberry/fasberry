import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { z } from "zod"
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";

async function removeStoreItem(id: number) {
  const query = await general
    .deleteFrom("store_items")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirstOrThrow()

  return query;
}

export const storeItemDelete = new Elysia()
  .use(validatePermission(PERMISSIONS.STORE.ITEM.DELETE))
  .delete("/:id", async ({ nickname, params }) => {
    const id = params.id;
    const data = await removeStoreItem(id);

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.STORE.ITEM.DELETE })
    
    return { data }
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })