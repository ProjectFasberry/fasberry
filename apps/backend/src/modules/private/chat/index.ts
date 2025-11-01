import { defineUser } from "#/lib/middlewares/define";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import { getNats } from "#/shared/nats/client";
import { metaSchema } from "#/shared/schemas";
import { logger } from "#/utils/config/logger";
import { getDirection } from "#/utils/config/paginate";
import { safeJsonParse, wrapMeta } from "#/utils/config/transforms";
import { Subscription } from "@nats-io/nats-core";
import Elysia from "elysia";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

const chatDataSchema = metaSchema.pick({ asc: true, endCursor: true })

type ChatItem = {
  id: number;
  created_at: Date;
  edited: boolean;
  edited_at: Date | null;
  message: string;
  nickname: string;
  views: number
}

const chatMessageViews = new Elysia()
  .get("/:id/views", async ({ params, query }) => {
    const id = params.id
    const cursor = query.endCursor;

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
      after: cursor,
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

    return { data }
  }, {
    params: z.object({
      id: z.coerce.number()
    }),
    query: metaSchema.pick({ endCursor: true })
  })

const chatData = new Elysia()
  .use(validatePermission(PERMISSIONS.PRIVATE.CHAT.READ))
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

const chatCreateMessageSchema = z.object({
  message: z.string().min(1).max(2025)
})

const chatDeleteMessageSchema = z.object({
  id: z.coerce.number()
})

const chatEditMessageSchema = z.object({
  id: z.coerce.number(),
  message: z.string().min(1).max(2025)
})

async function deleteMessage(nickname: string, id: number) {
  const query = await general
    .deleteFrom('privated_chat')
    .where("id", "=", id)
    .where("nickname", "=", nickname)
    .executeTakeFirstOrThrow()

  if (!query.numDeletedRows) {
    throw new Error('Not deleted')
  }

  return query;
}

async function editMessage(nickname: string, id: number, newMessage: string) {
  return general
    .updateTable('privated_chat')
    .set({
      message: newMessage,
      edited: true,
      edited_at: new Date().toISOString()
    })
    .where("id", "=", id)
    .where("nickname", "=", nickname)
    .returningAll()
    .executeTakeFirstOrThrow()
}

async function createMessage(nickname: string, message: string) {
  return general
    .insertInto("privated_chat")
    .values({ message, nickname })
    .returningAll()
    .executeTakeFirstOrThrow()
}

type ChatEventVariant = "create" | "delete" | "edit"

type ChatEvent<T> = {
  event: ChatEventVariant,
  data: T
}

const chatWs = new Elysia()
  .use(defineUser())
  .ws("/subscribe", {
    async open(ws) {
      const { nickname } = ws.data;
      if (!nickname) return ws.close(1008, "Unauthorized");

      const nc = getNats();
      const decoder = new TextDecoder();

      try {
        const sub = nc.subscribe(`privated.chat.*`, {
          callback: (err, msg) => {
            if (err) {
              logger.error("NATS callback error:", err);
              return;
            }

            const parts = msg.subject.split(".");
            const event = parts[2] as ChatEventVariant;
            if (!event) return;

            try {
              const decoded = decoder.decode(msg.data);
              const result = safeJsonParse<ChatItem>(decoded);

              if (!result.ok) {
                logger.warn("Invalid message payload");
                return;
              }

              const payload = { event, data: result.value };

              try {
                ws.send(payload);
              } catch (sendErr) {
                logger.error("WebSocket send failed:", sendErr);
              }
            } catch (parseErr) {
              logger.error("Failed to handle NATS message:", parseErr);
            }
          }
        });

        (ws.data as any).natsSub = sub;
      } catch (e) {
        logger.error("Failed to subscribe to NATS:", e);
        ws.close(1011, "Subscription error");
      }
    },

    async message(ws, raw) {
      const { nickname } = ws.data;
      console.log("message.raw", raw)

      if (!raw) return;

      const parsed = raw as ChatEvent<unknown>

      const nc = getNats();
      const { event, data } = parsed;

      const publish = (type: ChatEventVariant, value: unknown) => {
        nc.publish(`privated.chat.${type}`, JSON.stringify(value));
      };

      try {
        if (event === "create") {
          const body = chatCreateMessageSchema.parse(data);

          const created = await createMessage(nickname, body.message);
          publish("create", created);
        }

        if (event === "delete") {
          const body = chatDeleteMessageSchema.parse(data);

          await deleteMessage(nickname, body.id);
          publish("delete", { id: body.id });
        }

        if (event === "edit") {
          const body = chatEditMessageSchema.parse(data);

          const edited = await editMessage(nickname, body.id, body.message);
          publish("edit", edited);
        }
      } catch (e) {
        logger.error("Message handling failed:", e);
      }
    },
    async close(ws) {
      const sub = (ws.data as any)?.natsSub as Subscription | undefined;
      if (!sub) return;

      try {
        sub.unsubscribe();
        logger.log("NATS unsubscribed");
      } catch (e) {
        logger.error("Failed to unsubscribe NATS:", e);
      } finally {
        delete (ws.data as any).natsSub;
      }
    }
  })

export const chat = new Elysia()
  .group("/chat", app => app
    .use(chatData)
    .use(chatWs)
    .use(chatMessageViews)
  )