import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { PlayerLandsPayload } from "@repo/shared/types/entities/land"
import { logError } from "@/shared/lib/log"
import { withSsr } from "@/shared/lib/ssr"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { playerParamAtom } from "./player.model"
import { client } from "@/shared/lib/client-wrapper"
import { isEmptyArray } from "@/shared/lib/array"

export async function getLands(nickname: string, init?: RequestInit) {
  return client<PlayerLandsPayload>(`server/lands/list/${nickname}`, init).exec()
}

export const playerLandsAtom = atom<PlayerLandsPayload | null>(null).pipe(
  withSsr("lands"), withReset()
)

// on client
playerParamAtom.onChange((ctx, state) => {
  if (!state) return;
  playerLandsAction(ctx, state)
})

export const playerLandsAction = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(() => 
    getLands(nickname, { signal: ctx.controller.signal })
  )
}, {
  name: "playerLandsAction",
  onFulfill: (ctx, res) => {
    playerLandsAtom(ctx, isEmptyArray(res.data) ? null : res)
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())