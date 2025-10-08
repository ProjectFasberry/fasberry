import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getSeemsLikePlayersByPlayer, seemsPlayersSchema } from "./seems-players.model";
import { SeemsLikePlayersPayload } from "@repo/shared/types/entities/other";

export const seemsPlayers = new Elysia()
  .get("/seems-like/:nickname", async ({ status, query, params }) => {
    const nickname = params.nickname
    const data: SeemsLikePlayersPayload = await getSeemsLikePlayersByPlayer(nickname, query)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: seemsPlayersSchema
  })