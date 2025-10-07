import { bisquite } from "#/shared/database/bisquite-db"
import { reputation } from "#/shared/database/reputation-db"
import { getNats } from "#/shared/nats/client"
import { logError } from "#/utils/config/logger"
import { Msg } from "@nats-io/nats-core/lib/core"

type PlayerStats = {
  charism: number
  belkoin: number
  reputation: number,
  meta: string | null,
  displayName: string | null,
  totalPlaytime: number
}

async function getPlayerStats(nickname: string): Promise<PlayerStats> {
  let initial: PlayerStats = {
    charism: 0, meta: null, belkoin: 0, reputation: 0, displayName: null, totalPlaytime: 0
  }

  const main = await bisquite
    .selectFrom("CMI_users")
    .leftJoin("playerpoints_username_cache", "CMI_users.username", "playerpoints_username_cache.username")
    .leftJoin("playerpoints_points", "playerpoints_points.uuid", "playerpoints_username_cache.uuid")
    .select([
      "Balance",
      "UserMeta",
      "playerpoints_points.points",
      "CMI_users.player_uuid",
      "CMI_users.TotalPlayTime",
      "CMI_users.DisplayName"
    ])
    .where("CMI_users.username", "=", nickname)
    .executeTakeFirst()

  if (!main) {
    return initial
  }

  const result = await reputation
    .selectFrom("reputation")
    .select("reputation")
    .where("reputation.uuid", "=", main.player_uuid)
    .executeTakeFirst()

  initial = {
    charism: main.Balance ? Number(main.Balance.toFixed(2)) : 0,
    meta: main.UserMeta,
    belkoin: main.points ? Number(main.points.toFixed(2)) : 0,
    reputation: result?.reputation ? result.reputation : 0,
    displayName: main.DisplayName,
    totalPlaytime: main.TotalPlayTime ?? 0
  }

  return initial
}

async function handlePlayerStats(msg: Msg) {
  const subject = msg.subject
  const nickname = subject.split(".")[3]

  if (!nickname) {
    const payload = JSON.stringify({ error: "Invalid nickname" });

    return msg.respond(payload)
  }

  try {
    const stats = await getPlayerStats(nickname)

    return msg.respond(JSON.stringify(stats))
  } catch (e) {
    logError(e)
  }
}

export const subscribePlayerStats = () => {
  const nc = getNats()

  const subscription = nc.subscribe("todo" + ".*", {
    callback: (e, msg) => {
      if (e) return logError(e)

      void handlePlayerStats(msg)
    }
  })

  return subscription
}