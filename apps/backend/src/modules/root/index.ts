import Elysia, { t } from "elysia";
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { defineOptionalUser, defineUser } from "#/lib/middlewares/define";
import { AppOptionsPayload } from "@repo/shared/types/entities/other";
import { bannerExists } from "../shared/banner/banner.model";
import { withData } from "#/shared/schemas";
import { general } from "#/shared/database/main-db";

const appOptionsList = new Elysia()
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

async function getBan(nickname: string | null) {
  if (!nickname) return null;

  const query = await general
    .selectFrom("banned_users")
    .select(["created_at", "nickname", "reason"])
    .where("nickname", "=", nickname)
    .executeTakeFirst()

  return query ?? null
}

const banStatus = new Elysia()
  .use(defineUser())
  .model({
    "ban": withData(
      t.Nullable(
        t.Object({
          created_at: t.Date(),
          nickname: t.String(),
          reason: t.Nullable(t.String())
        })
      )
    )
  })
  .get("ban-status", async ({ nickname, status }) => {
    const data = await getBan(nickname)
    return status(200, { data })
  }, {
    response: {
      200: "ban"
    }
  })

const validateNickname = new Elysia()
  .model({
    "exists": withData(
      t.Nullable(
        t.String()
      )
    )
  })
  .get("/validate-nickname/:nickname", async ({ status, params }) => {
    const nickname = params.nickname;

    const query = await general
      .selectFrom("players")
      .select("nickname")
      .where("nickname", "=", nickname)
      .executeTakeFirst()

    const data = query?.nickname ?? null

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

const appOptions = new Elysia()
  .group("/app", app => app
    .use(appOptionsList)
  )

const healthCheck = new Elysia()
  .get("/health", ({ status }) => status(200))

export const root = new Elysia()
  .use(healthCheck)
  .use(appOptions)
  .use(banStatus)
  .use(validateNickname)