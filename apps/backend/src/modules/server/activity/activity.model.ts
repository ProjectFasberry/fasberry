import { general } from "#/shared/database/main-db";
import { getNats } from "#/shared/nats/client";
import { SERVER_EVENT_CHECK_PLAYER_STATUS, SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/subjects";
import dayjs from "dayjs";
import { sql } from "kysely";
import { getPlayerStatusGlobal } from "../status/status.model";
import { PlayerActivityPayload } from "@repo/shared/types/entities/user";

type PlayerStatus = {
  nickname: string;
  type: "online" | "offline"
}

async function getUserLastVisitTime(nickname: string) {
  const query = await general
    .selectFrom('activity_users')
    .select([
      'activity_users.event',
      sql<string>`(
        SELECT q.event
        FROM activity_users q
        WHERE q.nickname = activity_users.nickname
          AND q.type = 'quit'
          AND q.event > activity_users.event
        ORDER BY q.event ASC
        LIMIT 1
      )`.as('quit_event'),
    ])
    .where('activity_users.nickname', '=', nickname)
    .where('activity_users.type', '=', 'join')
    .orderBy('activity_users.event', 'desc')
    .limit(1)
    .executeTakeFirst();

  const data = {
    quited: query?.quit_event ? dayjs(query.quit_event).toDate() : null,
    joined: query?.event ? dayjs(query.event).toDate() : null
  }

  return data
}

export async function getPlayerStatus(nickname: string): Promise<PlayerActivityPayload> {
  const nc = getNats();

  try {
    const playerStatus = await getPlayerStatusGlobal(nickname)

    if (playerStatus) {
      const { currentServer } = playerStatus

      return { type: "online", nickname, server: currentServer, issued_date: dayjs().toDate() }
    } else {
      const payload = {
        event: SERVER_EVENT_CHECK_PLAYER_STATUS,
        nickname
      }

      const res = await nc.request(SERVER_USER_EVENT_SUBJECT, JSON.stringify(payload), { timeout: 1000 })

      if (res) {
        const { type } = res.json<PlayerStatus>();
        if (!type) throw new Error();

        const lastVisitTime = await getUserLastVisitTime(nickname);

        return { type: "offline", nickname, issued_date: dayjs(lastVisitTime["quited"]).toDate() }
      } else {
        return { nickname, issued_date: null, type: "offline" }
      }
    }
  } catch (e) {
    console.error(e)
    return { nickname, type: "offline", issued_date: null }
  }
}