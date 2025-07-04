import { normalizeIp } from "#/helpers/normalize-ip";
import { throwError } from "#/helpers/throw-error";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import { CacheControl } from "elysiajs-cdn-cache";
import { cacheSetup } from "#/lib/middlewares/cache-control";
import { ipSetup } from "#/lib/middlewares/ip";
import { getStaticObject } from "#/shared/minio/init";

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
  const data = target.ids.map((id) => ({
    news_id: id,
    initiator: target.ip
  }))

  await sqlite
    .insertInto("news_views")
    .values(data)
    .onConflict((oc) =>
      oc.columns(["news_id", "initiator"]).doNothing()
    )
    .executeTakeFirst()
}

export const soloNews = new Elysia()
  .use(cacheSetup())
  .get("/news/:id", async (ctx) => {
    const id = ctx.params.id

    try {
      const query = await sqlite
        .selectFrom("minecraft_news")
        .leftJoin('news_views', 'news_views.news_id', 'minecraft_news.id')
        .select([
          'minecraft_news.id',
          'minecraft_news.created_at',
          'minecraft_news.title',
          'minecraft_news.description',
          'minecraft_news.imageUrl',
          'minecraft_news.media_links',
          sqlite.fn.count('news_views.id').as('views')
        ])
        .where("minecraft_news.id", "=", Number(id))
        .groupBy([
          'minecraft_news.id',
          'minecraft_news.created_at',
          'minecraft_news.title',
          'minecraft_news.description',
          'minecraft_news.imageUrl',
          'minecraft_news.media_links'
        ])
        .executeTakeFirst()

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: query ?? null })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

export const news = new Elysia()
  .use(cacheSetup())
  .use(ipSetup())
  .get("/news", async (ctx) => {
    try {
      const { ascending, limit, cursor, search } = ctx.query;

      const DEFAULT_LIMIT = limit ?? 16;

      let query = sqlite
        .selectFrom('minecraft_news')
        .leftJoin('news_views', 'news_views.news_id', 'minecraft_news.id')
        .select([
          'minecraft_news.id',
          'minecraft_news.created_at',
          'minecraft_news.title',
          'minecraft_news.description',
          'minecraft_news.imageUrl',
          'minecraft_news.media_links',
          sqlite.fn.count('news_views.id').as('views')
        ])
        .groupBy([
          'minecraft_news.id',
          'minecraft_news.created_at',
          'minecraft_news.title',
          'minecraft_news.description',
          'minecraft_news.imageUrl',
          'minecraft_news.media_links'
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
        // @ts-expect-error
        parseCursor: (cursor) => {
          return {
            created_at: new Date(cursor.created_at),
          }
        },
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

      ctx.cacheControl.set(
        "Cache-Control",
        new CacheControl()
          .set("public", true)
          .set("max-age", 60)
          .set("s-maxage", 60)
      );

      return { data, meta: wrapMeta(res) }
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, { query: newsSchema })