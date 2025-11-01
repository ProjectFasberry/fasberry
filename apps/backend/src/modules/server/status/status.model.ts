import { getRedisKey } from "#/helpers/redis";
import { client } from "#/shared/api/client";
import { general } from "#/shared/database/main-db";
import { getNats } from "#/shared/nats/client";
import { SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/subjects";
import { getRedis } from "#/shared/redis/init";
import { logger } from "#/utils/config/logger";
import { safeJsonParse } from "#/utils/config/transforms";
import { StatusPayload } from "@repo/shared/types/entities/other";
import z from "zod";

type ServerStatus = {
  online: boolean;
  host: string;
  port: number;
  ip_address: string | null;
  eula_blocked: boolean;
  retrieved_at: number;
  expires_at: number;
  version?: {
    name_raw: string;
    name_clean: string;
    name_html: string;
    protocol: number;
  };
  players?: {
    online: number;
    max: number;
    list: Array<{
      uuid: string;
      name_raw: string;
      name_clean: string;
      name_html: string;
    }>;
  };
  motd?: {
    raw: string;
    clean: string;
    html: string;
  };
  icon: string | null;
  mods: Array<{
    name: string;
    version: string;
  }>;
  software?: string | null;
  plugins?: Array<{
    name: string;
    version: string | null;
  }>;
  srv_record: {
    host: string;
    port: number;
  } | null;
};

const initial = {
  status: "offline",
  online: 0,
  max: 200,
  players: []
}

type StatusPayloadGlobal = {
  maxPlayers: number,
  players: Array<string>,
  tps: Array<number>,
  currentOnline: number,
  mspt: number
}

async function getProxyStats(): Promise<ServerStatus | null> {
  let ip: string = "play.fasberry.su";

  const query = await general
    .selectFrom("ip_list")
    .select("ip")
    .where("name", "=", "server_proxy")
    .executeTakeFirst()

  if (query?.ip) {
    ip = query.ip
  }

  const res = await client.get(`https://api.mcstatus.io/v2/status/java/${ip}:25565`, {
    searchParams: { timeout: 1.0 }, throwHttpErrors: false
  })

  const data = await res.json<ServerStatus>()

  return data
}

export async function updateServerStatus() {
  const redis = getRedis()

  async function getData() {
    const rawProxy = await getProxyStats()

    if (rawProxy && rawProxy.online === false) {
      const data = {
        proxy: initial,
        servers: { bisquite: initial }
      }

      return data;
    }

    let rawBisquite: StatusPayloadGlobal | null = null;

    try {
      rawBisquite = await getBisquiteStats()
    } catch (e) {
      if (e instanceof Error) {
        logger.warn(e.message, e.stack)
      }
    }

    const proxy = rawProxy as ServerStatus

    const bisquite = (rawBisquite && "players" in rawBisquite) ? {
      online: rawBisquite.currentOnline,
      max: rawBisquite.maxPlayers,
      players: rawBisquite.players,
      status: "online"
    } : initial

    const data: StatusPayload = {
      proxy: {
        status: "online",
        online: proxy.players?.online ?? 0,
        max: proxy.players?.max ?? 200,
        players: proxy.players?.list ? proxy.players.list.map((player) => player.name_raw) : []
      },
      servers: { bisquite }
    }

    return data;
  }

  const data = await getData()

  await redis.set(SERVER_STATUS_KEY, JSON.stringify(data))
}

async function getBisquiteStats(): Promise<StatusPayloadGlobal | null> {
  const nc = getNats()

  const res = await nc.request(
    SERVER_USER_EVENT_SUBJECT, JSON.stringify({ event: "getServerStats" }), { timeout: 1000 }
  )

  if (!res) return null;

  if ("mspt" in res) {
    return res.json<StatusPayloadGlobal>()
  }

  return null;
}

const SERVER_STATUS_KEY = getRedisKey("internal", "server-status:data")

export async function getServerStatus() {
  const redis = getRedis()

  const dataStr = await redis.get(SERVER_STATUS_KEY)
  if (!dataStr) return null;

  const result = safeJsonParse<StatusPayload>(dataStr)
  if (!result.ok) return null;

  const data = result.value
  return data;
}