import { defineUser } from "#/lib/middlewares/define";
import { bisquite } from "#/shared/database/bisquite-db";
import { playerpoints } from "#/shared/database/playerpoints-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

async function getBalance(nickname: string) {
  const [charism, belkoin] = await Promise.all([
    bisquite
      .selectFrom("CMI_users")
      .select([
        "Balance as data"
      ])
      .where("CMI_users.nickname", "=", nickname)
      .executeTakeFirst(),
    playerpoints
      .selectFrom("playerpoints_points")
      .innerJoin("playerpoints_username_cache", "playerpoints_username_cache.uuid", "playerpoints_points.uuid")
      .select([
        "playerpoints_points.points as data"
      ])
      .where("playerpoints_username_cache.username", "=", nickname)
      .executeTakeFirst()
  ])

  return {
    charism: Number(charism?.data ?? 0),
    belkoin: Number(belkoin?.data ?? 0)
  }
}

export const balance = new Elysia()
  .use(defineUser())
  .get("/balance", async ({ nickname, status }) => {
    const data = await getBalance(nickname)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })