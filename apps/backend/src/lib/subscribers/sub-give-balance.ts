
import { playerPoints } from "#/shared/database/playerpoints-db"
import { getNatsConnection } from "#/shared/nats/nats-client"
import { logger } from "#/utils/config/logger"
import { sql } from "kysely"

export const subscribeGiveBalance = () => {
  const nc = getNatsConnection()

  logger.success("Subscribed to give balance")
  
  return nc.subscribe("give.balance", {
    callback: async (e, msg) => {
      if (e) {
        logger.error(e.message)
        return;
      }

      const nickname: string = msg.data.toString()

      try {
        const res = await playerPoints
          .updateTable("playerpoints_points")
          .set({ points: sql`points + 5` })
          .where("uuid", "=", 
            playerPoints
              .selectFrom("playerpoints_username_cache")
              .select("uuid")
              .where("username", "=", nickname)
          )
          .executeTakeFirstOrThrow()

        if (res.numUpdatedRows) {
          const payload = JSON.stringify({ result: "ok" });

          return msg.respond(payload)
        }

        return msg.respond(
          JSON.stringify({ error: "not updated" })
        )
      } catch (e) {
        if (e instanceof Error) {
          logger.error(e.message)
        }
      }
    }
  })
}