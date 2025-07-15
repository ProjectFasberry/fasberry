import { throwError } from "#/helpers/throw-error";
import { main } from "#/shared/database/main-db";
import { logger } from "#/utils/config/logger";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

async function getItem(id: string) {
  const donates = await main
    .selectFrom("store_donates")
    .selectAll()
    .where("origin", "=", id)
    .executeTakeFirst()

  if (donates) return donates;

  const events = await main
    .selectFrom("store_events")
    .selectAll()
    .where("origin", "=", id)
    .executeTakeFirst()

  if (events) return events;

  return null
}

export const storeItem = new Elysia()
  .get("/item/:id", async (ctx) => {
    const id = ctx.params.id

    try {
      const data = await getItem(id)

      console.log(data)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      logger.error(e)
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })