import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { z } from "zod"

async function removeStoreItem(id: number) {
  const query = await general
    .deleteFrom("store_items")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirstOrThrow()

  return query;
}

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

const storeItemEditSchema = z.object({
  key: z.enum(["description", "summary", "title", "imageUrl", "value", "command", "type"]),
  value: z.string().or(z.coerce.boolean())
})

export const storeItemEdit = new Elysia()
  .post("/edit/:id", async ({ params, body, status }) => { 
    const id = params.id;
    const data = await editStoreItem(id, body);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    }),
    body: storeItemEditSchema
})

export const storeItemDelete = new Elysia()
  .delete("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await removeStoreItem(id);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })