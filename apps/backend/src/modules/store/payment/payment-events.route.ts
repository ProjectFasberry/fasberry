import Elysia from "elysia";
import z from "zod";
import { getNats } from "#/shared/nats/client";
import { logger } from "#/utils/config/logger";
import { getOrder } from "../order.route";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { orderEventPayloadSchema } from "@repo/shared/schemas/payment";
import { Subscription } from "@nats-io/nats-core/lib/core";

function formatSSE(event: string, data: string): string {
  const lines = data.split(/\r?\n/).map(line => `data: ${line}`).join('\n');
  return `event: ${event}\n${lines}\n\n`;
}

const PING_TIMEOUT = 5000

const getPaymentEventsSubject = (uniqueId: string) => `payment.events.${uniqueId}`

export const paymentEvents = new Elysia()
  .get("/:id/events", async (ctx) => {
    const uniqueId = ctx.params.id;

    const data = await getOrder(uniqueId)

    if (!data) {
      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
    }

    if (data.status === 'succeeded') {
      logger.log("Payment is succeeded", uniqueId)
      return ctx.status(HttpStatusEnum.HTTP_200_OK)
    }

    const encoder = new TextEncoder();
    const controllerAbort = ctx.request.signal;

    let sub: Subscription;
    let pingInterval: Timer;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        logger.log(`[SSE]: Connection opened for order ${uniqueId}`);

        const nc = getNats();
        sub = nc.subscribe(getPaymentEventsSubject(uniqueId));
        const decoder = new TextDecoder();

        controller.enqueue(
          encoder.encode(
            formatSSE("hello", JSON.stringify({ message: "connected" }))
          )
        );

        pingInterval = setInterval(() => {
          controller.enqueue(encoder.encode(":\n\n"));
        }, PING_TIMEOUT);

        controllerAbort.addEventListener("abort", async () => {
          logger.log(`[SSE]: Abort signal received for order ${uniqueId}`);
          clearInterval(pingInterval);
          controller.close();
          
          try {
            if (sub) await sub.drain();
          } catch { }
        });

        try {
          for await (const msg of sub) {
            if (controllerAbort.aborted) break;

            let parsed: string;

            try {
              const decoded = decoder.decode(msg.data);
              const result = orderEventPayloadSchema.safeParse(JSON.parse(decoded));

              if (!result.success) {
                logger.warn(`[SSE]: Invalid message payload`, z.treeifyError(result.error));
                continue;
              }

              parsed = JSON.stringify(result.data);
            } catch {
              continue;
            }

            controller.enqueue(
              encoder.encode(
                formatSSE("payload", parsed)
              )
            );
          }
        } catch (err) {
          if (!controllerAbort.aborted) {
            logger.error("[SSE]: Error during NATS message processing", err);
          }
        } finally {
          logger.log(`[SSE]: Closing stream for order ${uniqueId}`);
          clearInterval(pingInterval);
          controller.close();

          if (sub) {
            await sub.drain();
            logger.log(`[SSE]: Drained subscription ${sub.getSubject()}`);
          }
        }
      },

      cancel() {
        logger.log(`[SSE]: Stream manually canceled by client for order ${uniqueId}`);
        clearInterval(pingInterval);
        if (sub) sub.unsubscribe();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  });