import Elysia, { t } from "elysia";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { withData } from "#/shared/schemas";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerExists } from "../../shared/banner/banner.model";
import { AppOptionsPayload } from "@repo/shared/types/entities/other";
import { general } from "#/shared/database/main-db";

export async function getBan(nickname: string | null) {
  if (!nickname) return null;

  const query = await general
    .selectFrom("banned_users")
    .select(["created_at", "nickname", "reason"])
    .where("nickname", "=", nickname)
    .executeTakeFirst()

  return query ?? null
}

export const appOptionsList = new Elysia()
  .use(defineOptionalUser())
  .model({
    "options": withData(
      t.Object({
        bannerIsExists: t.Boolean(),
        isBanned: t.Boolean()
      })
    )
  })
  .get("/options", async ({ nickname, status }) => {
    const bannerIsExists = await bannerExists(nickname)
    const isBanned = await getBan(nickname);

    const data: AppOptionsPayload = {
      bannerIsExists,
      isBanned: Boolean(isBanned)
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    response: {
      200: "options"
    }
  })