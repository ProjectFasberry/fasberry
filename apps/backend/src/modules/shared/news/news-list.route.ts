import { normalizeIp } from "#/helpers/normalize-ip";
import { getStaticUrl } from "#/helpers/volume";
import { ipPlugin } from "#/lib/plugins/ip";
import { general } from "#/shared/database/main-db";
import { metaSchema, searchQuerySchema, withData, withMeta } from "#/shared/schemas";
import { getDirection } from "#/utils/config/paginate";
import { wrapMeta } from "#/utils/config/transforms";
import { NewsPayload } from "@repo/shared/types/entities/news";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

const newsSchema = z.intersection(
  metaSchema.pick({ asc: true, endCursor: true, limit: true }),
  z.object({
    searchQuery: searchQuerySchema
  })
)

async function createNewsViews(target: { ids: number[], ip: string | null }) {
  if (target.ids.length === 0) return;

  const normalizedIp = normalizeIp(target.ip)
  if (!normalizedIp) return;

  const data = target.ids.map((id) => ({
    news_id: id,
    initiator: normalizedIp
  }))

  general
    .insertInto("news_views")
    .values(data)
    .onConflict((oc) =>
      oc.constraint("news_views_news_id_initiator_uniq").doNothing()
    )
    .execute()
}

const newsPayload = t.Object({
  id: t.Number(),
  title: t.String(),
  created_at: t.Date(),
  description: t.String(),
  imageUrl: t.Union([t.String(), t.Null()]),
  views: t.Number(),
  content: t.Object(t.Unknown()),
  creator: t.String()
})

export const newsList = new Elysia()
  .use(ipPlugin())
  .model({
    "news-list": withData(
      t.Object({
        data: t.Array(newsPayload),
        meta: withMeta
      })
    )
  })
  .get("/list", async ({ ip, status, set, ...ctx }) => {
    const { asc, limit, endCursor, searchQuery } = ctx.query;

    let query = general
      .selectFrom('news')
      .leftJoin('news_views', 'news_views.news_id', 'news.id')
      .select(eb => [
        'news.id',
        'news.created_at',
        'news.title',
        'news.description',
        'news.imageUrl',
        'news.content',
        'news.creator',
        eb.fn.countAll().as('views')
      ])
      .groupBy([
        'news.id',
        'news.created_at',
        'news.title',
        'news.description',
        'news.imageUrl',
        'news.content',
        'news.creator'
      ])

    if (searchQuery) {
      query = query.where("title", "like", `%${searchQuery}%`)
    }

    const direction = getDirection(asc)

    const res = await executeWithCursorPagination(query, {
      perPage: limit,
      after: endCursor,
      fields: [
        { key: "created_at", expression: "created_at", direction }
      ],
      parseCursor: (cursor) => ({
        created_at: new Date(cursor.created_at)
      })
    })

    const data = res.rows.map((news) => ({
      ...news,
      views: Number(news.views),
      imageUrl: getStaticUrl(news.imageUrl)
    }))

    createNewsViews({
      ids: data.map(target => target.id), ip
    })

    set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"
    set.headers["vary"] = "Origin"

    const response: NewsPayload = {
      data,
      meta: wrapMeta(res)
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data: response })
  }, {
    query: newsSchema,
    response: {
      200: "news-list"
    }
  })