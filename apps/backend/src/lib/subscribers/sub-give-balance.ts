import { playerpoints } from "#/shared/database/playerpoints-db"
import { getNatsConnection } from "#/shared/nats/client"
import { SERVER_EVENT_GIVE_BALANCE } from "#/shared/nats/subjects"
import { logError } from "#/utils/config/logger"
import { sql } from "kysely"

export const subscribeGiveBalance = () => {
  const nc = getNatsConnection()

  return nc.subscribe(SERVER_EVENT_GIVE_BALANCE, {
    callback: async (e, msg) => {
      if (e) {
        logError(e)
        return;
      }

      const nickname: string = msg.data.toString()

      try {
        let payload: string | null = null;

        const res = await playerpoints
          .updateTable("playerpoints_points")
          .set({ points: sql`points + 5` })
          .where("uuid", "=",
            playerpoints
              .selectFrom("playerpoints_username_cache")
              .select("uuid")
              .where("username", "=", nickname)
          )
          .executeTakeFirstOrThrow()

        if (res.numUpdatedRows) {
          payload = JSON.stringify({ result: "ok" });
          return msg.respond(payload)
        }

        payload = JSON.stringify({ error: "not updated" })

        return msg.respond(payload)
      } catch (e) {
        logError(e)
      }
    }
  })
}