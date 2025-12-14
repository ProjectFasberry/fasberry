import { validatePermission } from "#/lib/middlewares/validators";
import { Permissions } from "#/shared/constants/permissions";
import { general } from "#/shared/database/general-db";
import { getDirection } from "#/utils/config/paginate";
import Elysia from "elysia";
import { executeWithCursorPagination } from "kysely-paginate";
import type { ChatItem } from "./chat.model";
import { wrapMeta } from "#/utils/config/transforms";
import { metaSchema } from "#/shared/schemas";

const chatDataSchema = metaSchema.pick({ asc: true, endCursor: true })

export const chatData = new Elysia()
  .use(validatePermission(Permissions.get("PRIVATE.CHAT.READ")))
  .get("/list", async ({ query, nickname }) => {
    const baseQuery = general
      .selectFrom("privated_chat")
      .leftJoin("chat_views", "chat_views.message_id", "privated_chat.id")
      .select(eb => [
        "privated_chat.id",
        "privated_chat.created_at",
        "privated_chat.edited_at",
        "privated_chat.edited",
        "privated_chat.nickname",
        "privated_chat.message",
        eb.fn.coalesce(eb.fn.count('chat_views.id'), eb.val(0)).as('views'),
      ])
      .groupBy([
        "privated_chat.id",
        "privated_chat.created_at",
        "privated_chat.edited_at",
        "privated_chat.edited",
        "privated_chat.nickname",
        "privated_chat.message",
      ])

    const direction = getDirection(query.asc)

    const result = await executeWithCursorPagination(baseQuery, {
      perPage: 32,
      after: query.endCursor,
      fields: [
        { expression: "privated_chat.created_at", direction }
      ],
      parseCursor: (cursor) => ({
        created_at: new Date(cursor.created_at)
      })
    })

    const data: { data: ChatItem[], meta: PaginatedMeta } = {
      // @ts-expect-error
      data: result.rows,
      meta: wrapMeta(result)
    }

    const acc = data.data.map((d => ({
      nickname,
      message_id: d.id
    })))

    await general
      .insertInto("chat_views")
      .values(acc)
      .onConflict((oc) => oc.columns(["nickname", "message_id"]).doNothing())
      .execute()

    return { data }
  }, {
    query: chatDataSchema
  })