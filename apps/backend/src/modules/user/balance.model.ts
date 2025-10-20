import { bisquite } from "#/shared/database/bisquite-db"
import { playerpoints } from "#/shared/database/playerpoints-db"
import { CartFinalPrice } from "@repo/shared/types/entities/store"

export async function getBelkoin(nickname: string) {
  return playerpoints
    .selectFrom("playerpoints_points")
    .innerJoin("playerpoints_username_cache", "playerpoints_username_cache.uuid", "playerpoints_points.uuid")
    .select([
      "playerpoints_points.points as data"
    ])
    .where("playerpoints_username_cache.username", "=", nickname)
    .executeTakeFirst()
}

export async function getCharism(nickname: string) {
  return bisquite
    .selectFrom("CMI_users")
    .select([
      "Balance as data"
    ])
    .where("username", "=", nickname)
    .executeTakeFirst()
}

export async function getBalance(nickname: string): Promise<CartFinalPrice> {
  const [charism, belkoin] = await Promise.all([
    getCharism(nickname),
    getBelkoin(nickname)
  ])

  return {
    CHARISM: Number(charism?.data ?? 0),
    BELKOIN: Number(belkoin?.data ?? 0)
  }
}