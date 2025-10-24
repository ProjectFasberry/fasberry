import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";

const newsUpdateSchema = z.object({
  key: z.enum(["content", "description", "imageUrl", "title"]),
  value: z.string().or(z.object())
})

async function updateNews({ key, value }: z.infer<typeof newsUpdateSchema>) {
  const query = await general
    .updateTable("news")
    .set({ [key]: value })
    .returningAll()
    .executeTakeFirstOrThrow()

  return query;
}

export const newsUpdateRoute = new Elysia()
  .post("/edit", async ({ status, body }) => {
    const data = await updateNews(body);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: newsUpdateSchema
  })