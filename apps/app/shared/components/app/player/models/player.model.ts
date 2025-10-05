import { currentUserAtom } from "@/shared/models/current-user.model"
import { withHistory } from "@/shared/lib/reatom-helpers"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { User } from "@repo/shared/types/entities/user"
import { withSsr } from "@/shared/lib/ssr"
import { pageContextAtom } from "@/shared/models/global.model"

export const targetUserAtom = atom<User | null>(null, "targetUser").pipe(withSsr("targetUser"))

export const userParamAtom = atom<string | null>(
  (ctx) => ctx.spy(pageContextAtom)?.routeParams.nickname ?? null, "userParam"
).pipe(withHistory(), withReset())

export const isIdentityAtom = atom((ctx) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return false;

  const targetUser = ctx.spy(targetUserAtom)
  if (!targetUser) return false;

  return targetUser.nickname === currentUser.nickname;
}, "isIdentity")