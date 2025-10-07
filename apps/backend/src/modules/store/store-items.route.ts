import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { general } from "#/shared/database/main-db";
import { StoreItem } from "@repo/shared/types/entities/store";
import { definePrice, processImageUrl } from "#/utils/store/store-transforms";
import z from "zod";

export const GAME_CURRENCIES = ["CHARISM", "BELKOIN"] as const;
export type GameCurrency = typeof GAME_CURRENCIES[number]

async function getItems(args: z.infer<typeof donatesSchema>) {
  const limit = args.limit ?? 32

  let storeQuery = general
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

const donatesSchema = z.object({
  type: z.enum(["all", "donate", "events"]),
  limit: z.coerce.number().optional(),
  wallet: z.enum(["game", "real", "all"]).default("all")
})

export const storeItems = new Elysia()
  .get("/items", async ({ status, query }) => {
    const data: StoreItem[] = await getItems(query);

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: donatesSchema
  })