import { throwError } from "#/helpers/throw-error";
import { sqlite } from "#/shared/database/sqlite-db";
import { getNatsConnection } from "#/shared/nats/nats-client";
import { SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/nats-subjects";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import ky from "ky";
import { CacheControl } from 'elysiajs-cdn-cache';
import { cachePlugin } from "#/lib/middlewares/cache-control";
import { logger } from "#/utils/config/logger";
import { isProduction } from "#/helpers/is-production";

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

const statusSchema = t.Object({
  type: t.UnionEnum(["servers", "services"])
})

type StatusPayload = {
  maxPlayers: number,
  players: Array<string>,
  tps: Array<number>,
  currentOnline: number,
  mspt: number
}

async function getProxyStats(): Promise<ServerStatus | null> {
  let ip: string = "play.fasberry.su";

  const query = await sqlite
    .selectFrom("ip_list")
    .select("ip")
    .where("name", "=", "server_proxy")
    .executeTakeFirst()

  if (query?.ip) {
    ip = query.ip
  }

  const res = await ky.get(`https://api.mcstatus.io/v2/status/java/${ip}:25565`, { 
    searchParams: { timeout: 1.0 }, throwHttpErrors: false 
  })
  
  const data = await res.json<ServerStatus>()

  return data
}

async function getBisquiteStats(): Promise<StatusPayload | null> {
  const nc = getNatsConnection()

  const res = await nc.request(
    SERVER_USER_EVENT_SUBJECT, JSON.stringify({ event: "getServerStats" }), { timeout: 300 }
  )

  if (!res) return null;

  if ("mspt" in res) {
    return res.json<StatusPayload>()
  }

  return null;
}

export const status = new Elysia()
  .use(cachePlugin())
  .get("/status", async (ctx) => {
    const type = ctx.query.type;

    try {
      if (type === 'servers') {
        const rawProxy = await getProxyStats()

        if (rawProxy && rawProxy.online === false) {
          const data = {
            proxy: initial,
            servers: { bisquite: initial }
          }

          return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
        }

        let rawBisquite: StatusPayload | null = null;

        try {
          rawBisquite = await getBisquiteStats()
        } catch (e) {
          !isProduction && e instanceof Error && logger.warn(e.message, e.stack)
        }

        const proxy = rawProxy as ServerStatus

        const bisquite = (rawBisquite && "players" in rawBisquite) ? {
          online: rawBisquite.currentOnline,
          max: rawBisquite.maxPlayers,
          players: rawBisquite.players,
          status: "online"
        } : initial

        const data = {
          proxy: {
            status: "online",
            online: proxy.players?.online ?? 0,
            max: proxy.players?.max ?? 200,
            players: proxy.players?.list ? proxy.players.list.map((player) => player.name_raw) : []
          },
          servers: { bisquite }
        }

        ctx.cacheControl.set(
          "Cache-Control",
          new CacheControl()
            .set("public", true)
            .set("max-age", 60)
            .set("s-maxage", 60)
        );

        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
      }

      if (type === 'services') {
        return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError("Not supported"))
      }
      
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError("Not supported"))
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, { query: statusSchema })