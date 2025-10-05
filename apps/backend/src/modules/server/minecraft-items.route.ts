import Elysia from "elysia";
import { sql } from "kysely";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";

async function getMinecraftItems() {
  const query = await general
    .selectFrom("items")
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
  .get("/minecraft-items", async ({ status }) => {
    const data = await getMinecraftItems();
    return status(HttpStatusEnum.HTTP_200_OK, { data });
  })