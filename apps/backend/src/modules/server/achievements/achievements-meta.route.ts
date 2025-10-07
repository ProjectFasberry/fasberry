import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

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
  .get("/meta", async ({ status }) => {
    const data = await getAchievementsMeta()
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })