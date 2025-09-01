import { throwError } from "#/helpers/throw-error";
import { luckperms } from "#/shared/database/luckperms-db";
import Elysia, { Static, t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

// example permission's name:
// lobby = "lobby.*"
// bisquite = "bisquite.*"
// main = "main.*"

type AchievementDetails = {
  title: string,
  description: string,
  img: string | null
}

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

  const publicImage = `https://kong.fasberry.su/storage/v1/object/public/static/achievements/${v.img}`

  return { ...v, img: publicImage }
}

const achievementsSchema = t.UnionEnum(["lobby", "bisquite", "main"])

type AchievementType = Static<typeof achievementsSchema>

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
          achievementsSchema.enum.map(option =>
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

async function getAchievementsMeta() {
  return {
    total: 2,
    achievementsTypes: [
      { key: "main", title: "Основное" },
      { key: "lobby", title: "Лобби" },
      { key: "bisquite", title: "Bisquite" },
    ]
  }
}

export const achievementsMeta = new Elysia()
  .get("/achievements-meta", async (ctx) => {
    try {
      const data = await getAchievementsMeta()

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

export const achievements = new Elysia()
  .get("/achievements/:nickname", async (ctx) => {
    const nickname = ctx.params.nickname

    try {
      const data = await getAchievements(nickname)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })