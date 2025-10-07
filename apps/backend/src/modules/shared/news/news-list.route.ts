import { normalizeIp } from "#/helpers/normalize-ip";
import { getStaticUrl } from "#/helpers/volume";
import { ipPlugin } from "#/lib/plugins/ip";
import { general } from "#/shared/database/main-db";
import { getDirection } from "#/utils/config/paginate";
import { wrapMeta } from "#/utils/config/transforms";
import { NewsPayload } from "@repo/shared/types/entities/news";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

const newsSchema = z.object({
  limit: z.coerce.number().optional().default(16),
  ascending: z.stringbool().optional(),
  cursor: z.string().optional(),
  search: z.string().optional()
})

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

export const newsList = new Elysia()
  .use(ipPlugin())
  .get("/list", async ({ ip, status, set, ...ctx }) => {
    const { ascending, limit, cursor, search } = ctx.query;

    let query = general
      .selectFrom('news')
      .leftJoin('news_views', 'news_views.news_id', 'news.id')
      .select(eb => [
        'news.id',
        'news.created_at',
        'news.title',
        'news.description',
        'news.imageUrl',
        'news.media_links',
        eb.fn.countAll().as('views')
      ])
      .groupBy([
        'news.id',
        'news.created_at',
        'news.title',
        'news.description',
        'news.imageUrl',
        'news.media_links'
      ])

    if (search && search.length >= 1) {
      query = query.where("title", "like", `%${search}%`)
    }

    const direction = getDirection(ascending)

    const res = await executeWithCursorPagination(query, {
      perPage: limit,
      after: cursor,
      fields: [
        { key: "created_at", expression: "created_at", direction }
      ],
      parseCursor: (cursor) => ({
        created_at: new Date(cursor.created_at)
      })
    })

    const data = res.rows.map((news) => ({
      ...news,
      created_at: news.created_at.toString(),
      views: Number(news.views),
      imageUrl: news.imageUrl ? getStaticUrl(news.imageUrl) : null
    }))

    createNewsViews({
      ids: data.map(target => target.id), ip
    })

    set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"

    const response: NewsPayload = {
      data,
      meta: wrapMeta(res)
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data: response })
  }, {
    query: newsSchema
  })