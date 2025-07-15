import { throwError } from "#/helpers/throw-error";
import Elysia, { Static, t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticObject } from "#/shared/minio/init";
import { main } from "#/shared/database/main-db";
import { StoreItem } from "@repo/shared/types/entities/store";

async function getItems(args: Static<typeof donatesSchema>) {
  const limit = args.limit ?? 32

  let donatesQuery = main
    .selectFrom("store_donates")
    .select([
      "id",
      "title",
      "description",
      "price",
      "origin",
      "imageUrl",
    ])
    .orderBy("id", "asc")
    .limit(limit)
    
  let eventsQuery = main
    .selectFrom("store_events")
    .select([
      "id",
      "title",
      "description",
      "price",
      "wallet",
      "imageUrl",
      "origin"
    ])
    .orderBy("id", "asc")
    .limit(limit)

  function processImageUrl(target?: string | null) {
    if (target) {
      if (target.includes("https://")) {
        return target;
      }

      return getStaticObject(target)
    }

    return getStaticObject("icons/adventure_icon.png")
  }

  async function getEvents(): Promise<StoreItem[]> {
    if (args.wallet === 'game') {
      eventsQuery = eventsQuery.where('wallet', "in", ["charism", "belkoin"])
    }

    if (args.wallet === 'real') {
      eventsQuery = eventsQuery.where("wallet", "=", "real")
    }

    const query = await eventsQuery.execute()

    return query.map(item => {
      const imageUrl = processImageUrl(item.imageUrl)

      const details: StoreItem["details"] = {
        wallet: item.wallet as "charism" | "belkoin"
      } 

      const updated = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        origin: item.origin,
        details,
        type: "events",
        imageUrl
      }

      return updated
    })
  }

  async function getDonates(): Promise<StoreItem[]> {
    if (args.wallet === 'game') {
      return [];
    }

    const query = await donatesQuery.execute()

    return query.map((item) => {
      const imageUrl = processImageUrl(item.imageUrl)

      const details: StoreItem["details"] = {
        wallet: "real"
      }

      const updated = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        origin: item.origin, 
        type: "donates",
        details, 
        imageUrl
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
      getDonates(),
      getEvents()
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