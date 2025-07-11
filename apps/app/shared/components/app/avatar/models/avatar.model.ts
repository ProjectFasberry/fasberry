import { reatomAsync } from "@reatom/async"
import { atom } from "@reatom/core"
import { getSkinDetails } from "../../skin/models/skin.model"

export const avatarsUrls = atom<Record<string, string>>({}, "avatarUrls")
const avatarsIsLoading = atom<Record<string, boolean>>({}, "avatarUrls")

export const selectAvatar = (target: string) => atom((ctx) => {
  return ctx.spy(avatarsUrls)[target]
}, `${target}.avatar`)

export const selectAvatarStatus = (target: string) => atom((ctx) => {
  return ctx.spy(avatarsIsLoading)[target]
}, `${target}.avatarStatus`)

export const avatarAction = reatomAsync(async (ctx, nickname: string) => {
  const cache = ctx.get(selectAvatar(nickname))

  if (cache) {
    return { target: nickname, url: cache }
  }

  avatarsIsLoading(ctx, (state) => ({ ...state, [nickname]: true }))

  const url = await ctx.schedule(() => getSkinDetails({ type: "head", nickname }))

  return { url, target: nickname }
}, {
  name: "avatarAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { url, target } = res

    avatarsUrls(ctx, (state) => ({ ...state, [target]: url }))
    avatarsIsLoading(ctx, (state) => ({ ...state, [target]: false }))
  }
})