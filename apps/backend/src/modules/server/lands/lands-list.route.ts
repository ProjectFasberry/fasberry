import Elysia from "elysia"
import z from "zod"
import { bisquite } from "#/shared/database/bisquite-db"
import { getDirection } from "#/utils/config/paginate"
import { Lands, LandsPayload } from "@repo/shared/types/entities/land"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import { executeWithCursorPagination } from "kysely-paginate"

const landsSchema = z.object({
  cursor: z.string().optional()
})

async function getLands(
  { cursor }: z.infer<typeof landsSchema>
): Promise<LandsPayload> {
  const query = bisquite
    .selectFrom("lands_lands")
    .select([
      "ulid",
      "members",
      "title",
      "name",
      "level",
      "stats",
      "type",
      "created_at"
    ])

  const direction = getDirection(false)

  const res = await executeWithCursorPagination(query, {
    perPage: 16,
    after: cursor,
    fields: [
      { key: "created_at", direction, expression: "created_at" }
    ],
    parseCursor: (cursor) => ({
      created_at: new Date(cursor.created_at)
    }),
  })

  const lands: Lands[] = res.rows.map(land => ({
    ...land,
    stats: land.stats ? JSON.parse(land.stats) : null,
    members: JSON.parse(land.members)
  }))

  return {
    data: lands,
    meta: {
      startCursor: res.startCursor,
      endCursor: res.endCursor,
      hasNextPage: res.hasNextPage ?? false,
      hasPrevPage: res.hasPrevPage ?? false
    }
  }
}

export const landsList = new Elysia()
  .get("/list", async ({ status, query }) => {
    const { cursor } = query;

    const data: LandsPayload = await getLands({ cursor })

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: landsSchema
  })