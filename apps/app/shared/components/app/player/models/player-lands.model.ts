import { client } from "@/shared/api/client"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { Land } from "@repo/shared/types/entities/land"
import { logError } from "@/shared/lib/log"
import { withSsr } from "@/shared/lib/ssr"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { userParamAtom } from "./player.model"

type UserLands = {
  data: Land[],
  meta: {
    count: number
  }
}

export async function getLands(nickname: string, init?: RequestInit) {
  const res = await client(`server/lands/${nickname}`, { ...init })
  const data = await res.json<WrappedResponse<UserLands>>()
  if ("error" in data) throw new Error(data.error)
  return data
}

export const playerLandsAtom = atom<UserLands | null>(null).pipe(withSsr("lands"), withReset())

userParamAtom.onChange((ctx, state) => {
  if (!state) return;

  const nickname = state

  playerLandsAction(ctx, nickname)
})

export const playerLandsAction = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(() => getLands(nickname, { signal: ctx.controller.signal }))
}, {
  name: "playerLandsAction",
  onFulfill: (ctx, res) => {
    playerLandsAtom(ctx, res.data)
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())