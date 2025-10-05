import Elysia from "elysia";
import dayjs from "dayjs"
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { luckperms } from "#/shared/database/luckperms-db";
import { getPlayerAvatar } from "../server/skin.model";
import { Donate } from "@repo/shared/types/entities/donate";
import { defineOptionalUser } from "#/lib/middlewares/define";

async function getDonate(
  { recipient }: { recipient: string }
): Promise<{ group: Donate }> {
  const query = await luckperms
    .selectFrom("luckperms_user_permissions")
    .innerJoin("luckperms_players", "luckperms_players.uuid", "luckperms_user_permissions.uuid")
    .select([
      "luckperms_user_permissions.permission as group"
    ])
    .where("luckperms_user_permissions.permission", "like", `%group%`)
    .where("luckperms_players.username", "=", recipient)
    .executeTakeFirst()

  if (!query) return { group: "default" as Donate }

  return { group: query.group.slice(6) as Donate }
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

type PlayerMainPayload = {
  nickname: string;
  lowercase_nickname: string,
  uuid: string;
  details: {
    reg_date: Date,
    login_date: Date
  }
}

async function getMain(
  { recipient }: { recipient: string }
): Promise<PlayerMainPayload | null> {
  const query = await general
    .selectFrom("AUTH")
    .select([
      "NICKNAME as nickname",
      "REGDATE as reg_date",
      "LOGINDATE as login_date",
      "UUID as uuid",
      "LOWERCASENICKNAME as lowercase_nickname",
    ])
    .where("NICKNAME", "=", recipient)
    .executeTakeFirst()

  if (!query) return null;

  if (!query.uuid) {
    console.warn(`Player "${recipient}" has no UUID`);
    return null;
  }

  const reg_date = dayjs(Number(query.reg_date)).toDate();
  const login_date = dayjs(Number(query.login_date)).toDate()

  return {
    nickname: query.nickname,
    lowercase_nickname: query.lowercase_nickname,
    uuid: query.uuid,
    details: {
      reg_date,
      login_date
    }
  }
}

type PlayerPayload = Omit<PlayerMainPayload, "details"> & {
  avatar: string;
  details: Pick<PlayerMainPayload, "details">["details"] & {
    rate: PlayerRatePayload
  }
}

export const player = new Elysia()
  .use(defineOptionalUser())
  .get("/player/:nickname", async ({ status, nickname: initiator, params }) => {
    const recipient = params.nickname;

    const [main, group, avatar, details] = await Promise.all([
      getMain({ recipient }),
      getDonate({ recipient }),
      getPlayerAvatar({ recipient }),
      getRate({ recipient, initiator }),
    ]);

    if (!main || !group || !avatar || !details) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null });
    }

    const user: PlayerPayload = {
      ...main,
      ...group,
      avatar,
      details: {
        ...main.details,
        rate: details,
      },
    };
    
    return status(HttpStatusEnum.HTTP_200_OK, { data: user });
  })