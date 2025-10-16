import Elysia, { t } from "elysia";
import dayjs from "dayjs"
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { luckperms } from "#/shared/database/luckperms-db";
import { getPlayerAvatar } from "../server/skin/skin.model";
import { Donate } from "@repo/shared/types/entities/donate";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { sql } from "kysely";
import { Player } from "@repo/shared/types/entities/user";
import { withData } from "#/shared/schemas";

async function getDonate(
  { recipient }: { recipient: string }
): Promise<Donate> {
  const query = await luckperms
    .selectFrom("luckperms_user_permissions")
    .innerJoin("luckperms_players", "luckperms_players.uuid", "luckperms_user_permissions.uuid")
    .select([
      "luckperms_user_permissions.permission as group"
    ])
    .where("luckperms_user_permissions.permission", "like", `%group%`)
    .where("luckperms_players.username", "=", recipient)
    .executeTakeFirst()

  if (!query) return "default" as Donate

  return query.group.slice(6) as Donate
}

type PlayerRatePayload = {
  count: number;
  isRated: boolean
}

async function getRate(
  { initiator, recipient }: { initiator: string | null, recipient: string }
): Promise<PlayerRatePayload> {
  const base = general
    .selectFrom("likes")
    .select(eb => [
      eb.fn.countAll().as("count"),
      initiator
        ? eb.fn.count("initiator").filterWhere("initiator", "=", initiator).as("isRatedByInitiator")
        : eb.val(0).as("isRatedByInitiator"),
    ])
    .where("recipient", "=", recipient)

  const result = await base.executeTakeFirst();

  return {
    count: Number(result?.count ?? 0),
    isRated: !!Number(result?.isRatedByInitiator)
  };
}

async function getMain(
  { recipient }: { recipient: string }
): Promise<Omit<Player, "rate" | "avatar" | "group"> | null> {
  const query = await general
    .selectFrom("players")
    .leftJoin(
      "activity_users", (join) => join
        .on("activity_users.nickname", "=", "players.nickname")
        .on("activity_users.type", "=", sql`'quit'`)
    )
    .select([
      "players.nickname",
      "players.created_at as reg_date",
      "activity_users.event as login_date",
      "players.uuid",
      "players.lower_case_nickname",
    ])
    .where("players.nickname", "=", recipient)
    .executeTakeFirst()

  if (!query) return null;

  const { reg_date, login_date, ...base } = query;

  const regDate = dayjs(Number(query.reg_date)).toDate();
  const loginDate = dayjs(Number(query.login_date)).toDate()

  return {
    ...base,
    meta: {
      reg_date: regDate,
      login_date: loginDate
    }
  }
}

const PlayerPayload = t.Object({
  nickname: t.String(),
  lower_case_nickname: t.String(),
  uuid: t.String(),
  group: t.String(),
  avatar: t.String(),
  meta: t.Object({
    reg_date: t.Union([t.String(), t.Date()]),
    login_date: t.Union([t.String(), t.Date()])
  }),
  rate: t.Object({
    count: t.Number(),
    isRated: t.Boolean()
  })
})

export const player = new Elysia()
  .use(defineOptionalUser())
  .model({
    "player": withData(PlayerPayload)
  })
  .get("/player/:nickname", async ({ status, nickname: initiator, params }) => {
    const recipient = params.nickname;

    const [main, group, avatar, rate] = await Promise.all([
      getMain({ recipient }),
      getDonate({ recipient }),
      getPlayerAvatar({ recipient }),
      getRate({ recipient, initiator }),
    ]);

    if (!main || !group || !avatar || !rate) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null });
    }

    const { meta, ...some } = main

    const data: Player = {
      ...some,
      group,
      avatar,
      meta,
      rate,
    };

    return { data }
  }, {
    response: {
      200: "player",
      404: t.Object({ data: t.Null() })
    }
  })