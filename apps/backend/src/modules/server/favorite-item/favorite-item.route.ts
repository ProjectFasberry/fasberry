import Elysia from "elysia";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/general-db";
import { withData } from "#/shared/schemas";
import { itemPayload } from "./minecraft-items.route";

async function getFavoriteItem(nickname: string) {
  return general
    .selectFrom("items")
    .innerJoin("fv_items", "fv_items.id", "items.id")
    .select([
      "items.id",
      "items.image",
      "items.title",
      "items.description"
    ])
    .where("fv_items.nickname", "=", nickname)
    .groupBy([
      "items.id",
      "items.image",
      "items.title",
      "items.description"
    ])
    .limit(1)
    .orderBy("fv_items.created_at", "desc")
    .executeTakeFirst()
}

export const favoriteItem = new Elysia()
  .get("/fv-item/:nickname", async ({ params: { nickname } }) => {
    const item = await getFavoriteItem(nickname)

    if (!item) {
      return { data: null }
    }

    const image = getStaticUrl(item.image)

    const data = {
      ...item, 
      image
    }

    return { data }
  }, {
    response: {
      200: withData(itemPayload)
    }
  })