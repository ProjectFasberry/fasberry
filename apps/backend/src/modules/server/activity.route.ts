import Elysia from 'elysia';
import { getNatsConnection } from '#/shared/nats/client';
import { SERVER_EVENT_CHECK_PLAYER_STATUS, SERVER_USER_EVENT_SUBJECT } from '#/shared/nats/subjects';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { general } from '#/shared/database/main-db';
import dayjs from 'dayjs';
import { sql } from 'kysely';

type PlayerStatus = {
  nickname: string;
  type: "online" | "offline"
}

type Heatmap = Map<string, Map<number, number>>;

async function getPlayerHeatmap(
  nickname: string,
  { from, to }: { from?: Date, to?: Date } = {}
): Promise<Heatmap> {
  const now = dayjs();

  const fromDate = from ? dayjs(from) : now.subtract(1, "month");
  const toDate = to ? dayjs(to) : now.add(1, "month");

  const rows = await general
    .selectFrom('activity_users')
    .select(['event', 'type'])
    .where('nickname', '=', nickname)
    .where('event', '>=', fromDate.toDate())
    .where('event', '<', toDate.toDate())
    .orderBy('event', 'asc')
    .execute();

  const heatmap: Heatmap = new Map();

  if (rows.length === 0) return heatmap;

  for (let i = 0; i < rows.length; i++) {
    const e = rows[i];

    if (e.type !== 'join') continue;

    const start = new Date(e.event);
    const quitEvent = rows.slice(i + 1).find(ev => ev.type === 'quit');
    const end = quitEvent ? new Date(quitEvent.event) : new Date();

    if (end <= start) {
      const dateKey = start.toISOString().split('T')[0];
      const hour = start.getUTCHours();

      if (!heatmap.has(dateKey)) heatmap.set(dateKey, new Map());

      heatmap.get(dateKey)!.set(hour, (heatmap.get(dateKey)!.get(hour) || 0) + 1);

      continue;
    }

    let cursor = new Date(start);

    while (cursor < end) {
      const dateKey = cursor.toISOString().split('T')[0];
      const hour = cursor.getUTCHours();

      const nextHour = new Date(cursor);
      nextHour.setUTCHours(hour + 1, 0, 0, 0);

      const segmentEnd = nextHour < end ? nextHour : end;

      const minutes = Math.max(
        1,
        Math.ceil((segmentEnd.getTime() - cursor.getTime()) / 60000)
      );

      if (!heatmap.has(dateKey)) heatmap.set(dateKey, new Map());
      heatmap.get(dateKey)!.set(hour, (heatmap.get(dateKey)!.get(hour) || 0) + minutes);

      cursor.setTime(segmentEnd.getTime());
    }
  }

  return heatmap;
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

type GameStatusPayload = {
  nickname: string;
  type: string;
  issued_date: Date | null;
}

async function getPlayerStatus(nickname: string): Promise<GameStatusPayload> {
  const nc = getNatsConnection();

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

const now = new Elysia()
  .get("/now/:nickname", async ({ status, params }) => {
    const nickname = params.nickname;
    const data = await getPlayerStatus(nickname);
    return status(HttpStatusEnum.HTTP_200_OK, { data });
  })

type SummaryPayload = {
  [k: string]: {
    [k: string]: number;
  };
}

const summary = new Elysia()
  .get("/summary/:nickname", async ({ status, params }) => {
    const nickname = params.nickname;
    const payload = await getPlayerHeatmap(nickname);

    let data: SummaryPayload | null = Object.fromEntries(
      Array.from(payload.entries()).map(([date, hours]) => [
        date,
        Object.fromEntries(hours),
      ])
    );

    if (Object.entries(data).length === 0) {
      data = null;
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const activity = new Elysia()
  .group("/activity", app => app
    .use(now)
    .use(summary)
  )