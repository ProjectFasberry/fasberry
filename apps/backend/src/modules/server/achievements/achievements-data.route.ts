import { luckperms } from "#/shared/database/luckperms-db";
import { VOLUME_ENDPOINT } from "#/shared/env";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";

type AchievementDetails = {
  title: string,
  description: string,
  img: string | null
}

// example permission's name:
// lobby = "lobby.*"
// bisquite = "bisquite.*"
// main = "main.*"

export const ACHIEVEMENTS_RAW: Record<string, AchievementDetails> = {
  "lobby.secret.parkour": {
    title: "Секретный паркур",
    description: "Найти и пройти секретный паркур",
    img: "barrier.webp"
  },
  "main.integration.telegram": {
    title: "Вместе с Telegram",
    description: "Привязать свой аккаунт к Telegram",
    img: "allay_spawn_egg.webp"
  }
}

async function getAchievementDetails(achievement: string) {
  const v = ACHIEVEMENTS_RAW[achievement]

  const publicImage = `${VOLUME_ENDPOINT}/static/achievements/${v.img}`

  return { ...v, img: publicImage }
}

const achievementsSchema = z.enum(["lobby", "bisquite", "main"])

type AchievementType = z.infer<typeof achievementsSchema>

async function getAchievements(nickname: string) {
  const query = await luckperms
    .selectFrom("luckperms_user_permissions")
    .innerJoin(
      "luckperms_players",
      "luckperms_players.uuid",
      "luckperms_user_permissions.uuid",
    )
    .select(["permission"])
    .where("luckperms_players.username", "=", nickname)
    .where(eb =>
      eb.and([
        eb.or(
          achievementsSchema.options.map(option =>
            eb("luckperms_user_permissions.permission", "like", `${option}%`)
          )
        ),
        eb("luckperms_user_permissions.value", "=", true)
      ])
    )
    .execute()

  const res = await Promise.all(query.map(async perm => {
    const details = await getAchievementDetails(perm.permission)
    const firstKey = perm.permission.split(".")[0]

    return {
      type: firstKey as AchievementType,
      details
    }
  }))

  return res
}

export const achievementsByPlayer = new Elysia()
  .get("/:nickname", async ({ status, params }) => {
    const nickname = params.nickname
    const data = await getAchievements(nickname)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })