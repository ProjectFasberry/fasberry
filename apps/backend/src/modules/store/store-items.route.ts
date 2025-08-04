import Elysia, { Static, t } from "elysia";
import { throwError } from "#/helpers/throw-error";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { main } from "#/shared/database/main-db";
import { StoreItem } from "@repo/shared/types/entities/store";
import { definePrice, processImageUrl } from "#/utils/store/store-transforms";

export const GAME_CURRENCIES = ["CHARISM", "BELKOIN"] as const;
export type GameCurrency = typeof GAME_CURRENCIES[number]

async function getItems(args: Static<typeof donatesSchema>) {
  const limit = args.limit ?? 32

  let storeQuery = main
    .selectFrom("store_items")
    .select([
      "id",
      "title",
      "description",
      "price",
      "imageUrl",
      "type",
      "currency",
      "summary",
      "command",
      "value"
    ])
    .orderBy("id", "asc")
    .limit(limit)

  async function getEvents(): Promise<StoreItem[]> {
    if (args.wallet !== 'all') {
      const isGame = args.wallet === 'game';

      storeQuery = storeQuery.where(
        'currency',
        isGame ? "in" : "not in",
        GAME_CURRENCIES
      )
    }

    const query = await storeQuery
      .where("type", "=", "event")
      .execute()

    return query.map(item => {
      const imageUrl = processImageUrl(item.imageUrl)

      const updated = {
        ...item,
        imageUrl,
        price: definePrice(item.currency, item.price),
      }

      return updated
    })
  }

  async function getDonates(): Promise<StoreItem[]> {
    if (args.wallet === 'game') {
      return [];
    }

    const query = await storeQuery
      .where("type", "=", "donate")
      .execute()

    return query.map((item) => {
      const imageUrl = processImageUrl(item.imageUrl)

      const updated = {
        ...item,
        imageUrl,
        price: definePrice(item.currency, item.price),
      }

      return updated
    })
  }

  if (args.type === 'donate') {
    return getDonates()
  }

  if (args.type === 'events') {
    return getEvents()
  }

  if (args.type === 'all') {
    const [donates, events] = await Promise.all([
      getDonates(), getEvents()
    ])

    const query = [...donates, ...events]

    return query
  }

  throw new Error("Selected type is not defined")
}

const donatesSchema = t.Object({
  type: t.UnionEnum(["all", "donate", "events"]),
  limit: t.Optional(
    t.Number()
  ),
  wallet: t.UnionEnum(["game", "real", "all"], { default: "all" })
})

export const storeItems = new Elysia()
  .get("/items", async (ctx) => {
    const { type, limit, wallet } = ctx.query;

    try {
      const data: StoreItem[] = await getItems({ type, limit, wallet });

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  }, {
    query: donatesSchema
  })