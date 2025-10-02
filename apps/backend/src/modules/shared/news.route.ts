import { normalizeIp } from "#/helpers/normalize-ip";
import { throwError } from "#/helpers/throw-error";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import { ipPlugin } from "#/lib/plugins/ip";
import { getStaticObject } from "#/helpers/volume";
import { main } from "#/shared/database/main-db";

const newsSchema = t.Object({
  limit: t.Optional(
    t.Number()
  ),
  ascending: t.Optional(
    t.Boolean()
  ),
  cursor: t.Optional(
    t.String()
  ),
  search: t.Optional(
    t.String()
  )
})

function wrapMeta(res: Partial<PaginatedMeta>) {
  return {
    hasNextPage: res.hasNextPage ?? false,
    hasPrevPage: res.hasPrevPage ?? false,
    endCursor: res.endCursor,
    startCursor: res.startCursor
  }
}

async function createNewsViews(target: { ids: number[], ip: string }) {
  if (target.ids.length === 0) return

  const data = target.ids.map((id) => ({
    news_id: id,
    initiator: target.ip
  }))

  await main
    .insertInto("news_views")
    .values(data)
    .onConflict((oc) =>
      oc.constraint("news_views_news_id_initiator_uniq").doNothing()
    )
    .executeTakeFirst()
}

export const soloNews = new Elysia()
  .get("/news/:id", async (ctx) => {
    const id = ctx.params.id

    try {
      const query = await main
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

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: query ?? null })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

export const news = new Elysia()
  .use(ipPlugin())
  .get("/news", async (ctx) => {
    try {
      const { ascending, limit, cursor, search } = ctx.query;

      const DEFAULT_LIMIT = limit ?? 16;

      let query = main
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
        .limit(DEFAULT_LIMIT)

      if (search && search.length >= 1) {
        query = query.where("title", "like", `%${search}%`)
      }

      const res = await executeWithCursorPagination(query, {
        perPage: 16,
        after: cursor,
        fields: [
          {
            key: "created_at",
            direction: ascending ? "asc" : "desc",
            expression: "created_at",
          }
        ],
        parseCursor: (cursor) => ({
          created_at: new Date(cursor.created_at)
        })
      })

      const data = res.rows.map((news) => ({
        ...news,
        created_at: news.created_at.toString(),
        imageUrl: news.imageUrl ? getStaticObject(news.imageUrl) : null
      }))

      createNewsViews({
        ids: data.map(target => target.id),
        ip: normalizeIp(ctx.ip)
      })

      ctx.set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"

      return { data, meta: wrapMeta(res) }
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, { query: newsSchema })