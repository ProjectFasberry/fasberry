import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerSchema } from "./banner.model";

async function deleteBanner(id: number) {
  const query = await general
    .deleteFrom("banners")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirst()

  return query;
}

export const bannerDelete = new Elysia()
  .delete("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await deleteBanner(id);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: bannerSchema
  })
