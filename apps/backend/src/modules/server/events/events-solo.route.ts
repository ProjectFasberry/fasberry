import { getRedis } from "#/shared/redis/init";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { EVENTS_TARGET_KEY } from "./events.model";

async function getEvent(id: string) {
  const redis = getRedis();

  const eventStr = await redis.get(EVENTS_TARGET_KEY(id));
  if (!eventStr) return null;

  const event = JSON.parse(eventStr);
  return event;
}

export const eventsSolo = new Elysia()
  .get("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await getEvent(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })