import { defineUser } from "#/lib/middlewares/define";
import { general } from "#/shared/database/main-db";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerSchema } from "./banner.model";
import { withData } from "#/shared/schemas";

async function viewBanner(id: number, nickname: string) {
  const query = await general
    .insertInto("banners_views")
    .values({
      banner_id: id,
      nickname
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return query
}

const bannerViewPayload = t.Object({
  banner_id: t.Nullable(t.Number()),
  id: t.Number(),
  nickname: t.String()
})

export const bannerView = new Elysia()
  .use(defineUser())
  .model({
    "banner-view": withData(bannerViewPayload)
  })
  .post("/view/:id", async ({ status, nickname, params }) => {
    const id = params.id;
    const data = await viewBanner(id, nickname);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: bannerSchema,
    response: {
      200: "banner-view"
    }
  })
