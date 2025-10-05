import Elysia from "elysia";
import { normalizeIp } from "#/helpers/normalize-ip";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import { ipPlugin } from "#/lib/plugins/ip";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";
import z from "zod/v4";
import { getDirection } from "#/utils/config/paginate";

const newsSchema = z.object({
  limit: z.coerce.number().optional().default(16),
  ascending: z.stringbool().optional(),
  cursor: z.string().optional(),
  search: z.string().optional()
})

function wrapMeta(res: Partial<PaginatedMeta>) {
  return {
    hasNextPage: res.hasNextPage ?? false,
    hasPrevPage: res.hasPrevPage ?? false,
    endCursor: res.endCursor,
    startCursor: res.startCursor
  }
}

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

export const soloNews = new Elysia()
  .get("/news/:id", async ({ status, params }) => {
    const id = params.id

    const query = await general
      .selectFrom("news")
      .leftJoin('news_views', 'news_views.news_id', 'news.id')
      .select(eb => [
        'news.id',
        'news.created_at',
        'news.title',
        'news.description',
        'news.imageUrl',
        'news.media_links',
        eb.fn.count('news_views.id').as('views')
      ])
      .where("news.id", "=", Number(id))
      .groupBy([
        'news.id',
        'news.created_at',
        'news.title',
        'news.description',
        'news.imageUrl',
        'news.media_links'
      ])
      .limit(1)
      .executeTakeFirst()

    const data = query ?? null;

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const news = new Elysia()
  .use(ipPlugin())
  .get("/news", async ({ ip, status, set, ...ctx }) => {
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
      imageUrl: news.imageUrl ? getStaticUrl(news.imageUrl) : null
    }))

    createNewsViews({
      ids: data.map(target => target.id), ip
    })

    set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"

    const response = {
      data,
      meta: wrapMeta(res)
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data: response })
  }, {
    query: newsSchema
  })