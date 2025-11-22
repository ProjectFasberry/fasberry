import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { JsonValue } from "@repo/shared/types/db/auth-database-types";
import { defineUser } from "#/lib/middlewares/define";
import { HttpStatusEnum } from "elysia-http-status-code/status";

type PlayerSocialsValuePayload = {
  id: string | number,
  username: string
}

export type PlayerSocialsPayload = {
  type: "telegram" | "discord",
  value: PlayerSocialsValuePayload
}

type Initial = {
  id: number,
  created_at: Date,
  social: "telegram" | "discord",
  value: JsonValue
}

const playerSocialsAvailable = new Elysia()
  .use(defineUser())
  .get("/available", async ({ nickname }) => {
    const query = await general
      .selectFrom("players_socials")
      .select(["social"])
      .where("nickname", "=", nickname)
      .execute()

    const all = [{ title: "Telegram", social: "telegram" }, { title: "Discord", social: "discord" }]

    const data = query
      .map(i => all.map(t => t.social).includes(i.social) && all.find(t => t.social !== i.social))
      .filter(Boolean);

    return { data }
  })

const playerSocialsDelete = new Elysia()
  .use(defineUser())
  .delete("/:social", async ({ status, nickname, params }) => {
    const { social } = params;

    const query = await general
      .deleteFrom("players_socials")
      .where("social", '=', social)
      .where('nickname', "=", nickname)
      .executeTakeFirstOrThrow()

    if (!query.numDeletedRows) {
      throw status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
    }

    return { data: { social } }
  })

const playerSocialsList = new Elysia()
  .get("/list/:nickname", async ({ status, params }) => {
    const { nickname } = params;

    const query = await general
      .selectFrom("players_socials")
      .select([
        "id", "created_at", "social", "value"
      ])
      .where("nickname", "=", nickname.toLowerCase())
      .$castTo<Initial>()
      .execute();

    const payload = query.map((item) => {
      if (!item.value) throw new Error("No value in player socials");

      const result = item.value as PlayerSocialsValuePayload;

      return {
        type: item.social,
        value: result
      }
    })

    const data: PlayerSocialsPayload[] = payload

    return { data }
  })

export const playerSocials = new Elysia()
  .group("/socials", app => app
    .use(playerSocialsDelete)
    .use(playerSocialsAvailable)
    .use(playerSocialsList)
  )