import { throwError } from "#/helpers/throw-error";
import { getStaticObject } from "#/helpers/volume";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

async function getCurrencies() {
  const query = await sqlite
    .selectFrom("currencies")
    .select(["id", "value", "imageUrl", "title", "isAvailable"])
    .where("isPublic", "=", 1)
    .execute()

  return query.map(currency => ({
    ...currency,
    imageUrl: getStaticObject(currency.imageUrl)
  }))
}

export const currencies = new Elysia()
  .get("/currencies", async (ctx) => {

    try {
      const currencies = await getCurrencies()

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: currencies })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })