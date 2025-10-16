import Elysia from "elysia";
import { getAchievementsMeta } from "./achievements.model";

export const achievementsMeta = new Elysia()
  .get("/meta", async (ctx) => {
    const data = await getAchievementsMeta()
    return { data }
  })