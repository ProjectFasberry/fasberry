import Elysia from "elysia";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";

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
  .get("/fv-item/:nickname", async ({ status, params }) => {
    const nickname = params.nickname
    const item = await getFavoriteItem(nickname)

    if (!item) {
      return status(HttpStatusEnum.HTTP_200_OK, { data: null })
    }

    const image = getStaticUrl(item.image)

    const data = {
      ...item, 
      image
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })