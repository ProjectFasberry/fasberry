import Elysia from "elysia"
import { getPlayerGameInfo } from "./player.model"

export const playerStats = new Elysia()
  .get("/stats/:nickname", async ({ params }) => {
    const nickname = params.nickname
    const data = await getPlayerGameInfo(nickname)
    return { data }
  })