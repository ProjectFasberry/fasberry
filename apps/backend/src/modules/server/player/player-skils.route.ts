import Elysia from "elysia"
import { getSkills } from "./player.model"

export const playerSkills = new Elysia()
  .get("/skills/:nickname", async ({ params }) => {
    const nickname = params.nickname
    const data = await getSkills(nickname)
    return { data }
  })