import { playerpoints } from "#/shared/database/playerpoints-db"
import { getNats } from "#/shared/nats/client"
import { SERVER_EVENT_GIVE_BALANCE } from "#/shared/nats/subjects"
import { logError } from "#/utils/config/logger"
import { Msg } from "@nats-io/nats-core"
import { sql } from "kysely"

async function handleGiveBalance(msg: Msg) {
  const nickname = msg.data.toString();

  try {
    const res = await playerpoints
      .updateTable("playerpoints_points")
      .set({ points: sql`points + 5` })
      .where("uuid", "=",
        playerpoints
          .selectFrom("playerpoints_username_cache")
          .select("uuid")
          .where("username", "=", nickname)
      )
      .executeTakeFirstOrThrow();

    const payload = res.numUpdatedRows
      ? JSON.stringify({ result: "ok" })
      : JSON.stringify({ error: "not updated" });

    msg.respond(payload);
  } catch (e) {
    logError(e);
  }
}

export const subscribeGiveBalance = () => {
  const nc = getNats()

  const subscription = nc.subscribe(SERVER_EVENT_GIVE_BALANCE, {
    callback: (e, msg) => {
      if (e) return logError(e);

      void handleGiveBalance(msg)
    }
  })

  return subscription
}