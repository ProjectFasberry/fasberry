import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";

const updateOptionsSchema = z.object({
  name: z.string().min(1),
  value: z.boolean()
})

async function updateOptions({ name, value }: z.infer<typeof updateOptionsSchema>) {
  const query = await general
    .updateTable("options")
    .set({ name, value })
    .where("name", "=", name)
    .returning(["name", "value", "title"])
    .executeTakeFirstOrThrow()

  return query;
}

export const optionsUpdate = new Elysia()
  .post("/update", async ({ body }) => {
    const data = await updateOptions(body)
    return { data }
  }, {
    body: updateOptionsSchema
  })