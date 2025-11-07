import Elysia from "elysia";
import { defineUser } from "#/lib/middlewares/define";
import { getNats } from "#/shared/nats/client";
import { logger } from "#/utils/config/logger";
import { safeJsonParse } from "#/utils/config/transforms";
import { Subscription } from "@nats-io/nats-core";
import {
  chatCreateMessageSchema,
  chatDeleteMessageSchema,
  chatEditMessageSchema,
  ChatEvent, ChatEventVariant,
  ChatItem,
  createMessage,
  deleteMessage,
  editMessage
} from "./chat.model";

export const chatWs = new Elysia()
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