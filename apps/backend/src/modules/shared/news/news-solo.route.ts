import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";

async function getNews(id: number) {
  const query = await general
    .selectFrom("news")
    .leftJoin('news_views', 'news_views.news_id', 'news.id')
    .select(eb => [
      'news.id',
      'news.created_at',
      'news.title',
      'news.description',
      'news.imageUrl',
      'news.creator',
      'news.content',
      eb.fn.count('news_views.id').as('views')
    ])
    .where("news.id", "=", id)
    .groupBy([
      'news.id',
      'news.created_at',
      'news.title',
      'news.description',
      'news.imageUrl',
      'news.creator',
      'news.content'
    ])
    .limit(1)
    .executeTakeFirst()

  if (!query) return null;

  return {
    ...query,
    imageUrl: getStaticUrl(query.imageUrl)
  }
}

export const newsSolo = new Elysia()
  .get("/:id", async ({ status, params }) => {
    const id = params.id
    const data = await getNews(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })