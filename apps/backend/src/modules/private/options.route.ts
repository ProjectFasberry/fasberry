import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod/v4";

const optionsList = new Elysia()
  .get("/list", async (ctx) => {
    const data = await general
      .selectFrom("options")
      .select([
        "name",
        "value",
        "title"
      ])
      .execute()

    return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
  })

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

const updateOptionsRoute = new Elysia()
  .post("/update", async ({ body, status }) => {
    const data = await updateOptions(body)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: updateOptionsSchema
  })

export const options = new Elysia()
  .group("/options", app => app
    .use(optionsList)
    .use(updateOptionsRoute)
  )