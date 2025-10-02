import { throwError } from '#/helpers/throw-error';
import { getNatsConnection } from '#/shared/nats/client';
import { SERVER_EVENT_CHECK_PLAYER_STATUS, SERVER_USER_EVENT_SUBJECT } from '#/shared/nats/subjects';
import Elysia from 'elysia';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { main } from '#/shared/database/main-db';

type PlayerStatus = {
  nickname: string;
  type: "online" | "offline"
}

export async function getUserLastVisitTime(nickname: string) {
  return main
    .selectFrom("game_status")
    .select(["quited", "joined"])
    .where("nickname", "=", nickname)
    .executeTakeFirst()
}

async function getPlayerStatus(nickname: string) {
  const nc = getNatsConnection();

  const lastVisitTime = await getUserLastVisitTime(nickname);

  const payload = {
    event: SERVER_EVENT_CHECK_PLAYER_STATUS,
    nickname
  }

  const res = await nc.request(SERVER_USER_EVENT_SUBJECT, JSON.stringify(payload), { timeout: 4000 })

  if (res) {
    const status = res.json<PlayerStatus>();

    if (!lastVisitTime) {
      return { ...status, issued_date: null }
    }

    let statusType: "joined" | "quited" = "quited";

    if (status.type) {
      statusType = status.type === "online" ? "joined" : "quited";
    }

    return { ...status, issued_date: lastVisitTime[statusType] }
  } else {
    return { nickname, type: "offline", issued_date: lastVisitTime?.quited }
  }
}

export const userGameStatus = new Elysia()
  .get("/user-game-status/:nickname", async (ctx) => {
    const nickname = ctx.params.nickname;

    try {
      const data = await getPlayerStatus(nickname);

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data });
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  })