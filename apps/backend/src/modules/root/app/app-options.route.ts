import Elysia, { t } from "elysia";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { withData } from "#/shared/schemas";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerExists } from "../../shared/banner/banner.model";
import type { AppOptionsPayload } from "@repo/shared/types/entities/other";
import { libertybans } from "#/shared/database/libertybans-db";

export async function getBan(nickname: string | null) {
  if (!nickname) return null;

  const query = await libertybans
    .selectFrom("libertybans_victims")
    .innerJoin("libertybans_names", "libertybans_names.uuid", "libertybans_victims.uuid")
    .innerJoin("libertybans_bans", "libertybans_bans.victim", "libertybans_bans.id")
    .innerJoin("libertybans_punishments", "libertybans_punishments.id", "libertybans_bans.id")
    .select([
      "libertybans_punishments.start as created_at",
      "libertybans_names.name as nickname",
      "libertybans_punishments.reason"
    ])
    .where("libertybans_names.lower_name", "=", nickname.toLowerCase())
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