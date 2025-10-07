import { general } from "#/shared/database/main-db";
import { getDirection } from "#/utils/config/paginate";
import { wrapMeta } from "#/utils/config/transforms";
import { BannersPayload } from "@repo/shared/types/entities/banner";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

const bannersListSchema = z.object({
  ascending: z.stringbool().optional(),
  cursor: z.string().optional(),
  searchQuery: z.string().min(1).max(256).optional()
})

async function getBanners(
  { ascending, cursor, searchQuery }: z.infer<typeof bannersListSchema>
) {
  const direction = getDirection(ascending);

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
    after: cursor,
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

export const bannerList = new Elysia()
  .get("/list", async ({ status, query }) => {
    const data: BannersPayload = await getBanners(query);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: bannersListSchema
  })