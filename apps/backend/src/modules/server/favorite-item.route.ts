import { throwError } from "#/helpers/throw-error";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticUrl } from "../shared/news.route";

async function getFavoriteItem(favoriteId: string) {
  const query = await sqlite
    .selectFrom("minecraft_items")
    .select([
      "image",
      "id",
      "title",
      "description"
    ])
    .where("id", "=", Number(favoriteId))
    .executeTakeFirst();

  return query;
}

export const favoriteItem = new Elysia()
  .get("/get-favorite-item/:nickname", async (ctx) => {
    const { nickname } = ctx.params

    try {
      const favoriteItem = await getFavoriteItem(nickname)

      if (!favoriteItem) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
      }

      let favoriteItemImage = getStaticUrl(favoriteItem.image)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: { ...favoriteItem, image: favoriteItemImage } })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  })
