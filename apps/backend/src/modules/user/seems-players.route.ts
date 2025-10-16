import Elysia, { t } from "elysia";
import { getSeemsLikePlayersByPlayer, seemsPlayersSchema } from "./seems-players.model";
import { SeemsLikePlayersPayload } from "@repo/shared/types/entities/other";
import { withData } from "#/shared/schemas";

const seemsPlayersPayload = t.Object({
  data: t.Array(t.Object({
    nickname: t.String(),
    uuid: t.String(),
    seemsRate: t.Number()
  })),
  meta: t.Object({
    count: t.Number()
  })
})

export const seemsPlayers = new Elysia()
  .model({
    "seems-players": withData(seemsPlayersPayload)
  })
  .get("/seems-like/:nickname", async ({ query, params }) => {
    const nickname = params.nickname
    const data: SeemsLikePlayersPayload = await getSeemsLikePlayersByPlayer(nickname, query)
    return { data }
  }, {
    query: seemsPlayersSchema,
    response: {
      200: "seems-players"
    }
  })