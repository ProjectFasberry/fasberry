import { defineUser } from "#/lib/middlewares/define";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerSchema } from "./banner.model";

async function viewBanner(id: number, nickname: string) {
  const query = await general
    .insertInto("banners_views")
    .values({
      banner_id: id,
      nickname
    })
    .returningAll()
    .executeTakeFirst()

  return query;
}

export const bannerView = new Elysia()
  .use(defineUser())
  .post("/view/:id", async ({ status, nickname, params }) => {
    const id = params.id;
    const data = await viewBanner(id, nickname);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: bannerSchema
  })
