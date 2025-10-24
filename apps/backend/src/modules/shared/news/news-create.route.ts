import { createNewsSchema } from '@repo/shared/schemas/news';
import Elysia from "elysia"
import z from "zod"
import { general } from "#/shared/database/main-db"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import { getStaticUrl } from "#/helpers/volume"
import { defineUser } from "#/lib/middlewares/define"

async function createNews(
  { title, description, content, imageUrl }: z.infer<typeof createNewsSchema>, 
  creator: string
) {
  const query = await general
    .insertInto("news")
    .values({ title, description, imageUrl, content, creator })
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    ...query,
    imageUrl: getStaticUrl(query.imageUrl)
  }
}

export const newsCreateRoute = new Elysia()
  .use(defineUser())
  .post("/create", async ({ status, body, nickname }) => {
    const data = await createNews(body, nickname)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: createNewsSchema
  })