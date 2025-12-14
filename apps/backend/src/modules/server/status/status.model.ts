import { invariant } from "#/helpers/invariant";
import { getRedisKey } from "#/helpers/redis";
import { client } from "#/shared/api/client";
import { getUrls } from "#/shared/constants/urls";
import { PANEL_PASSWORD, PANEL_USER } from "#/shared/env";
import { getRedis } from "#/shared/redis/init";
import { safeJsonParse } from "#/utils/config/transforms";
import type { StatusPayload } from "@repo/shared/types/entities/other";

type CountPayload = { count: number }

type Player = {
  username: string,
  uuid: string,
  currentServer: string
}

type PlayerListPayload = {
  count: number,
  players: Player[]
}

type ServersPayload = { [key: string]: number }

export type PlayerPayload = Player & {
  ping: number,
  sessionDurationSeconds: number
}

type HealthPayload = { status: string }

const initial = {
  status: "offline",
  online: 0,
  max: 200,
  players: []
}

function getClient() {
  const urls = getUrls();
  const panelUrl = urls.get("panel")

  invariant(panelUrl, "Panel url is not defined")

  return client.extend((opts) => ({ 
    ...opts,
    prefixUrl: `https://${panelUrl}`
  }));
}

const authHeaders = {
  "authorization": `Basic ${btoa(PANEL_USER + ":" + PANEL_PASSWORD)}`
}

async function getCount(): Promise<CountPayload> {
  const client = getClient();
  return client("count", { headers: { ...authHeaders } }).json()
}

async function getPlayerList(): Promise<PlayerListPayload> {
  const client = getClient();
  return client("playerlist", { headers: { ...authHeaders } }).json()
}

async function getServers(): Promise<ServersPayload> {
  const client = getClient();
  return client("servers", { headers: { ...authHeaders } }).json()
}

async function getHealth(): Promise<HealthPayload> {
  const client = getClient();
  return client("health", { headers: { ...authHeaders } }).json()
}

export async function getPlayerStatusGlobal(username: string): Promise<PlayerPayload | null> {
  const client = getClient();

  try {
    return await client(`player/${username}`, { headers: { ...authHeaders }, timeout: 1000, retry: 1 }).json()
  } catch (e) {
    return null;
  }
}

async function getProxyStats() {
  const [onlineResult, serversResult, statusResult, playersList] = await Promise.all([
    getCount(), getServers(), getHealth(), getPlayerList()
  ])

  return {
    online: onlineResult.count,
    servers: serversResult,
    status: statusResult.status,
    playersList
  }
}

async function getData() {
  try {
    const proxy = await getProxyStats()

    if (proxy.status !== 'ok') {
      const data = {
        proxy: initial,
        servers: {}
      }

      return data;
    }

    const servers: StatusPayload["servers"] = Object.entries(proxy.servers)
      .reduce((acc, [key, _]) => {
        const online = proxy.servers[key];
        const list = proxy.playersList.players
          .filter(d => d.currentServer === key)
          .map(d => d.username);

        acc[key.toLowerCase()] = {
          online,
          players: list,
          status: "online",
          max: 200
        };

        return acc;
      }, {} as StatusPayload["servers"]);

    const data: StatusPayload = {
      proxy: {
        status: "online",
        online: proxy.playersList.count,
        max: 200,
        players: proxy.playersList.players.map(d => d.username)
      },
      servers
    }

    return data;
  } catch (e) {
    if (e instanceof Error) {
      console.error("Failed to update server status", e.message);
    }
  }
}

export async function updateServerStatus() {
  const redis = getRedis()
  const data = await getData()
  await redis.set(SERVER_STATUS_KEY, JSON.stringify(data))
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