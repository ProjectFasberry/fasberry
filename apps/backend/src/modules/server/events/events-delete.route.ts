import { getRedis } from "#/shared/redis/init";
import { EventPayload } from "@repo/shared/types/entities/other";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { EVENTS_ALL_KEY, EVENTS_TARGET_KEY, EVENTS_TYPE_KEY } from "./events.model";

async function deleteEvent(id: string) {
  const redis = getRedis();

  const eventStr = await redis.get(EVENTS_TARGET_KEY(id));
  if (!eventStr) return false;

  const event: EventPayload = JSON.parse(eventStr);
  const type = event.type;

  const results = await redis
    .multi()
    .del(EVENTS_TARGET_KEY(id))
    .lrem(EVENTS_ALL_KEY, 0, id)
    .srem(EVENTS_TYPE_KEY(type), id)
    .exec();

  if (!results) throw new Error('Transaction failed');

  const [delRes, lremRes, sremRes]: [number, number, number] = results.map(([err, val]) => {
    if (err) throw err;
    return val;
  }) as [number, number, number];

  const success = delRes >= 0 && lremRes >= 0 && sremRes >= 0;
  if (!success) throw new Error("Event is not deleted")

  return id
}

export const eventsDelete = new Elysia()
  .delete("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await deleteEvent(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })