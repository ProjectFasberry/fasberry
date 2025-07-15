import { currentUserAtom } from "@/shared/models/current-user.model"
import { withHistory } from "@/shared/lib/reatom-helpers"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { User } from "@repo/shared/types/entities/user"

export const targetUserAtom = atom<User | null>(null, "targetUser")

export const userParam = atom<string | null>((ctx) => {
  const state = ctx.spy(targetUserAtom)
  if (!state) return null
  return state.nickname
}, "userParam").pipe(withHistory(), withReset())

export const isIdentityAtom = atom((ctx) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return false;

  const targetUser = ctx.spy(targetUserAtom)
  if (!targetUser) return false;

  return targetUser.nickname === currentUser.nickname;
}, "isIdentity")