import Elysia from "elysia";
import { getAchievements } from "./achievements.model";

export const achievementsByPlayer = new Elysia()
  .get("/:nickname", async ({ params }) => {
    const nickname = params.nickname
    const data = await getAchievements(nickname)
    return { data }
  })