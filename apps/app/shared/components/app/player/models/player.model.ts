import { currentUserAtom } from "@/shared/models/current-user.model"
import { withHistory } from "@/shared/lib/reatom-helpers"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { Player } from "@repo/shared/types/entities/user"
import { withSsr } from "@/shared/lib/ssr"
import { pageContextAtom } from "@/shared/models/global.model"
import { client } from "@/shared/api/client"

export const playerAtom = atom<Player | null>(null, "player").pipe(withSsr("player"))

export const userParamAtom = atom<string | null>(
  (ctx) => ctx.spy(pageContextAtom)?.routeParams.nickname ?? null, "userParam"
).pipe(withHistory(), withReset())

export const isIdentityAtom = atom<boolean>((ctx) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return false;

  const targetPlayer = ctx.spy(playerAtom)
  if (!targetPlayer) return false;

  return targetPlayer.nickname === currentUser.nickname;
}, "isIdentity")

export async function getPlayer(nickname: string, init: RequestInit) {
  const res = await client(`server/player/${nickname}`, { throwHttpErrors: false, ...init })
  const data = await res.json<WrappedResponse<Player>>()
  if ('error' in data) throw new Error(data.error)
  return data.data
}