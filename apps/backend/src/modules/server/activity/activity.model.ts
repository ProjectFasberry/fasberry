import { general } from "#/shared/database/main-db";
import { getNats } from "#/shared/nats/client";
import { SERVER_EVENT_CHECK_PLAYER_STATUS, SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/subjects";
import dayjs from "dayjs";
import { sql } from "kysely";

type PlayerStatus = {
  nickname: string;
  type: "online" | "offline"
}

type GameStatusPayload = {
  nickname: string;
  type: string;
  issued_date: Date | null;
}

async function getUserLastVisitTime(nickname: string) {
  const query = await general
    .selectFrom('activity_users as lj')
    .select([
      'lj.event as join_event',
      sql<string>`(
        SELECT q.event
        FROM activity_users q
        WHERE q.nickname = lj.nickname
          AND q.type = 'quit'
          AND q.event > lj.event
        ORDER BY q.event ASC
        LIMIT 1
      )`.as('quit_event'),
    ])
    .where('lj.nickname', '=', nickname)
    .where('lj.type', '=', 'join')
    .orderBy('lj.event', 'desc')
    .limit(1)
    .executeTakeFirst();

  const data = {
    quited: query?.join_event ? dayjs(query.quit_event).toDate() : null,
    joined: query?.join_event ? dayjs(query.join_event).toDate() : null
  }

  return data
}

export async function getPlayerStatus(nickname: string): Promise<GameStatusPayload> {
  const nc = getNats();

  const lastVisitTime = await getUserLastVisitTime(nickname);

  const payload = {
    event: SERVER_EVENT_CHECK_PLAYER_STATUS,
    nickname
  }

  try {
    const res = await nc.request(SERVER_USER_EVENT_SUBJECT, JSON.stringify(payload), { timeout: 1000 })

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
      return { nickname, type: "offline", issued_date: lastVisitTime?.quited ?? null }
    }
  } catch (e) {
    return { nickname, type: "offline", issued_date: lastVisitTime?.quited ?? null }
  }
}