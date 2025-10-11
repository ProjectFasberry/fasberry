import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { PlayerLandsPayload } from "@repo/shared/types/entities/land"
import { logError } from "@/shared/lib/log"
import { withSsr } from "@/shared/lib/ssr"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { userParamAtom } from "./player.model"
import { client, withLogging } from "@/shared/lib/client-wrapper"

export async function getLands(nickname: string, init?: RequestInit) {
  return client<PlayerLandsPayload>(`server/lands/list/${nickname}`, init)
    .pipe(withLogging())
    .exec()
}

export const playerLandsAtom = atom<PlayerLandsPayload | null>(null).pipe(withSsr("lands"), withReset())

userParamAtom.onChange((ctx, state) => {
  if (!state) return;

  const history = ctx.get(userParamAtom.history)

  if (history.length > 1) {
    playerLandsAction(ctx, state)
  }
})

export const playerLandsAction = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(() => getLands(nickname, { signal: ctx.controller.signal }))
}, {
  name: "playerLandsAction",
  onFulfill: (ctx, res) => {
    playerLandsAtom(ctx, res)
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())