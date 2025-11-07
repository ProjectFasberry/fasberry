import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { metaSchema } from "#/shared/schemas";
import { wrapMeta } from "#/utils/config/transforms";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

const chatMessageViewsSchema = metaSchema.pick({ endCursor: true })

async function getViews(id: number, { endCursor }: z.infer<typeof chatMessageViewsSchema>) {
  const views = await general
    .selectFrom("chat_views")
    .select("id")
    .where("message_id", "=", id)
    .limit(64)
    .execute();

  if (views.length >= 64) {
    return { data: views, meta: wrapMeta({ hasNextPage: false, hasPrevPage: false }) }
  }

  const baseQuery = general
    .selectFrom("chat_views")
    .select([
      "id",
      "nickname",
      "message_id",
      "created_at"
    ])
    .where("message_id", "=", id)

  const result = await executeWithCursorPagination(baseQuery, {
    after: endCursor,
    perPage: 32,
    fields: [
      { expression: "created_at", direction: "asc" }
    ],
    parseCursor: (cursor) => ({
      created_at: new Date(cursor.created_at)
    })
  })

  const data = {
    data: result.rows,
    meta: wrapMeta(result)
  }

  return data;
}

export const chatMessageViews = new Elysia()
  .get("/:id/views", async ({ params, query }) => {
    const id = params.id
    const data = await getViews(id, query)
    return { data }
  }, {
    params: z.object({ id: z.coerce.number() }),
    query: chatMessageViewsSchema
  })