import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { z } from "zod"

async function removeStoreItem(id: number) {
  const query = await general
    .deleteFrom("store_items")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirstOrThrow()

  return query;
}

export const storeItemDelete = new Elysia()
  .delete("/:id", async ({ params }) => {
    const id = params.id;
    const data = await removeStoreItem(id);
    return { data }
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })