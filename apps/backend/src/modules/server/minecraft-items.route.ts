import { sqlite } from "#/shared/database/sqlite-db";
import { sql } from "kysely";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { getStaticUrl } from "../shared/news.route";

async function getMinecraftItems() {
  const query = await sqlite
    .selectFrom("minecraft_items")
    .select([
      "description",
      "title",
      "image",
      sql`CAST(id AS INT)`.as("id"),
    ])
    .$castTo<{ id: number, title: string, image: string, description: string | null }>()
    .execute();

  return query.map((item) => ({
    ...item,
    image: getStaticUrl(item.image)
  }))
}

export const minecraftItems = new Elysia()
  .get("/minecraft-items", async (ctx) => {
    try {
      const items = await getMinecraftItems();

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: items });
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  })
