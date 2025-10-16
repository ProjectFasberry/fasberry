import Elysia, { t } from "elysia";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";
import { withData } from "#/shared/schemas";

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

const currencyPayload = t.Object({
  id: t.Number(),
  imageUrl: t.String(),
  isAvailable: t.Boolean(),
  title: t.String(),
  value: t.String(),
})

export const currencies = new Elysia()
  .model({
    "currencies-list": withData(
      t.Array(currencyPayload)
    )
  })
  .get("/currencies", async (ctx) => {
    const data = await getCurrencies()
    return { data }
  }, {
    response: {
      200: "currencies-list"
    }
  })