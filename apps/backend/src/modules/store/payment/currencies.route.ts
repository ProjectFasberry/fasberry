import Elysia from "elysia";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";

async function getCurrencies() {
  const query = await general
    .selectFrom("currencies")
    .select(["id", "value", "imageUrl", "title", "isAvailable"])
    .where("isPublic", "=", true)
    .execute()

  const data = query.map(currency => ({
    ...currency,
    imageUrl: getStaticUrl(currency.imageUrl)
  }))

  return data
}

export const currencies = new Elysia()
  .get("/currencies", async (ctx) => {
    const currencies = await getCurrencies()

    return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: currencies })
  })