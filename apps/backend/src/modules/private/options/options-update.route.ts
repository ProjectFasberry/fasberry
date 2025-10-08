import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";

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
  .post("/update", async ({ body, status }) => {
    const data = await updateOptions(body)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: updateOptionsSchema
  })