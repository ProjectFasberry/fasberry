
import { playerPoints } from "#/shared/database/playerpoints-db"
import { getNatsConnection } from "#/shared/nats/nats-client"
import { natsLogger } from "@repo/lib/logger"
import { sql } from "kysely"

export const subscribeGiveBalance = () => {
  const nc = getNatsConnection()

  console.log("Subscribed to give balance")
  
  return nc.subscribe("give.balance", {
    callback: async (err, msg) => {
      if (err) {
        console.error(err)
        return
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
          return msg.respond(JSON.stringify({ result: "ok" }))
        }

        return msg.respond(JSON.stringify({ error: "not updated" }))
      } catch (e) {
        console.error(e)
      }
    }
  })
}