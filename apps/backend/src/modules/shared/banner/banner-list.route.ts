import { general } from "#/shared/database/main-db";
import { metaSchema, withData, withMeta } from "#/shared/schemas";
import { getDirection } from "#/utils/config/paginate";
import { wrapMeta } from "#/utils/config/transforms";
import { BannersPayload } from "@repo/shared/types/entities/banner";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

const bannersListSchema = z.intersection(
  metaSchema.pick({ asc: true, endCursor: true }),
  z.object({
    searchQuery: z.string().min(1).max(256).optional()
  })
)

async function getBanners(
  { asc, endCursor, searchQuery }: z.infer<typeof bannersListSchema>
) {
  const direction = getDirection(asc);

  let query = general
    .selectFrom("banners")
    .select([
      "id",
      "created_at",
      "title",
      "description",
      "href_title",
      "href_value"
    ])

  if (searchQuery) {
    query = query.where("title", "like", `%${searchQuery}%`)
  }

  const result = await executeWithCursorPagination(query, {
    perPage: 16,
    after: endCursor,
    fields: [
      { key: "created_at", expression: "created_at", direction }
    ],
    parseCursor: (cursor) => ({
      created_at: new Date(cursor.created_at)
    })
  })

  const data = {
    data: result.rows.map((banner) => ({ ...banner, href: { title: banner.href_title, value: banner.href_value } })),
    meta: wrapMeta(result)
  }

  return data
}

export const bannerPayload = t.Object({
  id: t.Number(),
  title: t.String(),
  description: t.Union([t.String(), t.Null()]),
  href: t.Object({
    title: t.String(),
    value: t.String(),
  })
})

export const bannerList = new Elysia()
  .model({
    "banners-list": withData(
      t.Object({  
        data: t.Array(bannerPayload),
        meta: withMeta
      })
    )
  })
  .get("/list", async ({ status, query }) => {
    const data: BannersPayload = await getBanners(query);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: bannersListSchema,
    response: {
      200: "banners-list"
    }
  })