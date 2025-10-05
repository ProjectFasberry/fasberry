import Elysia from "elysia";
import { getRedisClient } from "#/shared/redis/init";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { nanoid } from "nanoid";
import z from "zod/v4";
import { getRedisKey } from "#/helpers/redis";
import { defineAdmin } from "#/lib/middlewares/define";

type EventPayload = {
  id: string,
  type: string,
  title: string,
  content: {
    created_at: string,
    initiator: string,
    description: string | null
  }
}

const EVENTS_ALL_KEY = getRedisKey("internal", "events:all:data")
const EVENTS_TARGET_KEY = (id: string) => getRedisKey("internal", `events:event:${id}`)
const EVENTS_TYPE_KEY = (type: string) => getRedisKey("internal", `events:type:${type}`)

const eventTypeSchema = z.enum(["game", "log", "system"])

const createEventSchema = z.object({
  type: eventTypeSchema,
  title: z.string().min(1).max(64),
  initiator: z.string().min(1).max(32),
  description: z.string().max(128).transform((v) => (v.trim().length === 0 ? null : v)).nullable().default(null)
})

const eventsListSchema = z.object({
  type: eventTypeSchema.optional()
})

async function getEvents(
  { type }: z.infer<typeof eventsListSchema>
): Promise<EventPayload[]> {
  const redis = getRedisClient();

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

async function deleteEvent(id: string) {
  const redis = getRedisClient();

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

export async function cleanOldEvents(bs = 100) {
  const redis = getRedisClient();
  const types = eventTypeSchema.options

  for (const type of types) {
    let start = 0;

    while (true) {
      const ids = await redis.zrange(EVENTS_TYPE_KEY(type), start, start + bs - 1);
      if (!ids.length) break;

      for (const id of ids) {
        const exists = await redis.exists(EVENTS_TARGET_KEY(id));

        if (!exists) {
          await redis.zrem(EVENTS_TYPE_KEY(type), id);
        }
      }

      if (ids.length < bs) break;
      start += bs;
    }
  }

  let start = 0;

  while (true) {
    const allIds = await redis.lrange(EVENTS_ALL_KEY, start, start + bs - 1);
    if (!allIds.length) break;

    for (const id of allIds) {
      const exists = await redis.exists(EVENTS_TARGET_KEY(id));

      if (!exists) {
        await redis.lrem(EVENTS_ALL_KEY, 0, id);
      }
    }

    if (allIds.length < bs) break;
    start += bs;
  }
}

export async function createEvent(
  { title, type, initiator, description }: z.infer<typeof createEventSchema>
) {
  const redis = getRedisClient();

  const event: EventPayload = {
    id: nanoid(8),
    title,
    type,
    content: {
      initiator,
      description,
      created_at: new Date().toISOString(),
    }
  }

  const ttl = 60 * 60 * 24 * 30

  const results = await redis
    .multi()
    .set(EVENTS_TARGET_KEY(event.id), JSON.stringify(event), 'EX', ttl)
    .rpush(EVENTS_ALL_KEY, event.id)
    .zadd(EVENTS_TYPE_KEY(type), Date.now(), event.id)
    .exec();

  if (!results) throw new Error('Transaction failed');

  const [setRes, rpushRes, saddRes]: [string, number, number] = results.map(([err, val]) => {
    if (err) throw err;
    return val;
  }) as [string, number, number];

  const success = setRes === 'OK' && rpushRes >= 1 && saddRes >= 0;
  if (!success) throw new Error("Event is not created")

  return event
}

async function getEvent(id: string) {
  const redis = getRedisClient();

  const eventStr = await redis.get(EVENTS_TARGET_KEY(id));
  if (!eventStr) return null;

  const event = JSON.parse(eventStr);
  return event;
}

const event = new Elysia()
  .get("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await getEvent(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

const createEventRoute = new Elysia()
  .post("/create", async ({ status, body }) => {
    const data = await createEvent(body)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: createEventSchema
  })

const eventsList = new Elysia()
  .get("/list", async ({ status, query }) => {
    const data = await getEvents(query);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: eventsListSchema
  })

const deleteEventRoute = new Elysia()
  .delete("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await deleteEvent(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const events = new Elysia()
  .group("/events", app => app
    .use(eventsList)
    .use(event)
    .use(defineAdmin())
    .use(createEventRoute)
    .use(deleteEventRoute)
  )