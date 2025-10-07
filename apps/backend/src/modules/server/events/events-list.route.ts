import { getRedis } from "#/shared/redis/init";
import { EventPayload } from "@repo/shared/types/entities/other";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";
import { EVENTS_ALL_KEY, EVENTS_TARGET_KEY, EVENTS_TYPE_KEY, eventTypeSchema } from "./events.model";

const eventsListSchema = z.object({
  type: eventTypeSchema.optional()
})

async function getEvents(
  { type }: z.infer<typeof eventsListSchema>
): Promise<EventPayload[]> {
  const redis = getRedis();

  async function getObjects(keys: string[]): Promise<EventPayload[]> {
    if (keys.length === 0) return [];

    const values = await redis.mget(keys);

    return values
      .filter((v): v is string => v !== null)
      .map(v => JSON.parse(v) as EventPayload);
  }

  if (type) {
    const ids = await redis.zrevrange(EVENTS_TYPE_KEY(type), 0, 31);
    const keys = ids.map(id => EVENTS_TARGET_KEY(id));

    return getObjects(keys);
  }

  const limit = 32;
  const ids = await redis.lrange(EVENTS_ALL_KEY, 0, limit - 1);
  const keys = ids.map(id => EVENTS_TARGET_KEY(id));

  return getObjects(keys);
}

export const eventsList = new Elysia()
  .get("/list", async ({ status, query }) => {
    const data = await getEvents(query);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: eventsListSchema
  })