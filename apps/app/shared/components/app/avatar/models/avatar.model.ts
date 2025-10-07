import { reatomAsync } from "@reatom/async"
import { getSkinDetails } from "../../skin/models/skin.model"
import { batch, CtxSpy, reatomMap } from "@reatom/framework"
import { logError } from "@/shared/lib/log"

export const avatarsAtom = reatomMap<string, string>(new Map(), "avatars")
export const avatarsLoadingAtom = reatomMap<string, boolean>(new Map(), "avatarsLoading")

export const getAvatar = (ctx: CtxSpy, nickname: string) => ctx.spy(avatarsAtom).get(nickname)
export const getAvatarState = (ctx: CtxSpy, nickname: string) => ctx.spy(avatarsLoadingAtom).get(nickname)

export const avatarAction = reatomAsync(async (ctx, nickname: string) => {
  const cachedUrl = avatarsAtom.get(ctx, nickname)
  if (cachedUrl) return;

  avatarsLoadingAtom.set(ctx, nickname, true)

  const url = await ctx.schedule(() => getSkinDetails(
    { type: "head", nickname }, { signal: ctx.controller.signal })
  )

  return { url, nickname }
}, {
  name: "avatarAction",
  onFulfill: (ctx, result) => {
    if (!result) return;

    const { url, nickname } = result

    batch(ctx, () => {
      avatarsAtom.getOrCreate(ctx, nickname, () => url)
      avatarsLoadingAtom.set(ctx, nickname, false)
    })
  },
  onReject: (_, e) => {
    logError(e)
  }
})