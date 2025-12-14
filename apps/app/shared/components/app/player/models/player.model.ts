import { currentUserAtom } from "@/shared/models/current-user.model"
import { withHistory } from "@/shared/lib/reatom-helpers"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { Player } from "@repo/shared/types/entities/user"
import { withSsr } from "@/shared/lib/ssr"
import { client } from "@/shared/lib/client-wrapper"

export type PlayerOmitted = Omit<Player, "rate">

export const playerAtom = atom<PlayerOmitted | null>(null, "player").pipe(
  withSsr("player")
)

export const playerParamAtom = atom<string | null>(null, "playerParam").pipe(
  withHistory(), withReset(), withSsr("playerParam")
)

playerAtom.onChange((ctx, state) => {
  if (!state) return;

  if (!ctx.get(playerParamAtom)) {
    playerParamAtom(ctx, state.nickname)
  }
})

export const isIdentityAtom = atom<boolean>((ctx) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return false;

  const targetPlayer = ctx.spy(playerAtom)
  if (!targetPlayer) return false;

  return targetPlayer.nickname === currentUser.nickname;
}, "isIdentity")

export async function getPlayer(nickname: string, init: RequestInit) {
  return client<Player>(`server/player/${nickname}`, { ...init, throwHttpErrors: false }).exec()
}