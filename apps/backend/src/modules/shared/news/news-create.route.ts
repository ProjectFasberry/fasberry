import Elysia from "elysia"
import z from "zod"
import { general } from "#/shared/database/main-db"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import { getStaticUrl } from "#/helpers/volume"

const DEFAULT_IMAGE = `/news/art-bzzvanet.webp`

const createNewsSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().trim().nullable().optional().transform((v) => v?.trim() || DEFAULT_IMAGE),
})

async function createNews({ title, description, imageUrl }: z.infer<typeof createNewsSchema>) {
  const query = await general
    .insertInto("news")
    .values({
      title,
      description,
      imageUrl
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    ...query,
    imageUrl: getStaticUrl(query.imageUrl)
  }
}

export const newsCreateRoute = new Elysia()
  .post("/create", async ({ status, body }) => {
    const data = await createNews(body)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: createNewsSchema
  })