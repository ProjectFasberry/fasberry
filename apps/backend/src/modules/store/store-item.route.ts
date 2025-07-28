import { throwError } from "#/helpers/throw-error";
import { main } from "#/shared/database/main-db";
import { logger } from "#/utils/config/logger";
import { StoreItem } from "@repo/shared/types/entities/store";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { GAME_CURRENCIES, GameCurrency, processImageUrl } from "./store-items.route";

export function definePrice(currency: string, price: string): number {
  return GAME_CURRENCIES.includes(currency as GameCurrency) ? Number(price) : Number(price) / 100
}

async function getItem(id: number): Promise<StoreItem | null> {
  const query = await main
    .selectFrom("store_items")
    .select([
      "id",
      "title",
      "description",
      "price",
      "imageUrl",
      "summary",
      "type",
      "value",
      "currency",
      "command",
    ])
    .where("id", "=", id)
    .executeTakeFirst()

  if (!query) return null;

  const imageUrl = processImageUrl(query.imageUrl)

  const data = {
    ...query,
    imageUrl,
    price: definePrice(query.currency, query.price),
  }

  return data
}

export const storeItem = new Elysia()
  .get("/item/:id", async (ctx) => {
    const id = ctx.params.id

    try {
      const data = await getItem(id)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      logger.error(e)
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    params: t.Object({
      id: t.Number()
    })
  })