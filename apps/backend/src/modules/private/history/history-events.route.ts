import { defineUser } from "#/lib/middlewares/define";
import { sseLogger } from "#/modules/store/order/order-events.route";
import { getNats } from "#/shared/nats/client";
import Elysia, { sse } from "elysia";
import { ACTIVITY_LOG_SUBJECT } from "../private.model";
import { safeJsonParse } from "#/utils/config/transforms";

type HistoryPayload = {
  event: string;
  id: number;
  created_at: Date;
  initiator: string;
}

export const historyEvents = new Elysia()
  .use(defineUser())
  .get("/events", async function* ({ nickname }) {
    const nc = getNats()
    const decoder = new TextDecoder();
    const queue: unknown[] = [];

    yield sse({ event: "config", data: "connected" });
    sseLogger.log("Connected", nickname);

    const sub = nc.subscribe(ACTIVITY_LOG_SUBJECT, {
      callback: (e, msg) => {
        try {
          if (e) {
            sseLogger.warn("Failed to process message", e);
            throw e
          }
          
          const decoded = decoder.decode(msg.data);
          const result = safeJsonParse<HistoryPayload>(decoded)

          if (!result.ok) {
            sseLogger.warn(`Invalid message payload`);
            return;
          }

          queue.push(result.value);
        } catch (e) {
          sseLogger.warn("Failed to process message", e);
        }
      }
    })

    try {
      while (true) {
        while (queue.length) {
          const msg = queue.shift();
          if (msg) yield sse({ data: msg, event: "payload" })
        }
        yield sse({ event: "config", data: "ping" });
        await new Promise((r) => setTimeout(r, 1000));
      }
    } finally {
      sseLogger.log("NATS unsubscribed")
      sub.unsubscribe();
    }
  })