import { currentUserAtom } from "@/shared/models/current-user.model";
import { action, atom, reatomAsync, reatomMap, withAssign, withCache, withDataAtom, withReset, withStatusesAtom } from "@reatom/framework";
import { isEmptyArray } from "@/shared/lib/array";
import { client } from "@/shared/lib/client-wrapper";
import { toast } from "sonner";
import { getPlayerSocials, PlayerSocialsPayload } from "../../player/models/socials.model";

export const profileSocialsAction = reatomAsync(async (ctx) => {
  const nickname = ctx.get(currentUserAtom)!.nickname;

  return await ctx.schedule(() => getPlayerSocials(nickname, { signal: ctx.controller.signal }));
}).pipe(withDataAtom([]), withCache({ swr: false }), withStatusesAtom())

const socialStatusAtom = reatomMap<string, boolean>()

export const getSocialStatusAtom = (type: string) => atom((ctx) =>
  ctx.spy(socialStatusAtom).get(type) ?? false,
  "getSocialStatus"
)

type SocialAvailablePayload = {
  title: string, social: PlayerSocialsPayload["type"]
}

export const socialsAvailableAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<SocialAvailablePayload[]>("server/socials/available", { signal: ctx.controller.signal }).exec()
  )
}).pipe(
  withDataAtom([], (_, data) => isEmptyArray(data) ? null : data),
  withCache({ swr: false }),
  withStatusesAtom()
)

const socialRemoveAction = reatomAsync(async (ctx, type: PlayerSocialsPayload["type"]) => {
  const result = await ctx.schedule(() =>
    client.delete<{ type: PlayerSocialsPayload["type"] }>(`server/socials/${type}`).exec()
  )

  return { result, type }
}, {
  name: "profileSocialRemoveAction",
  onFulfill: (ctx, res) => {
    profileSocialsAction.cacheAtom.reset(ctx)
    profileSocialsAction.dataAtom(ctx, (state) => state.filter(t => t.type !== res.type))
  },
  onReject: (ctx, e) => {
    toast.error("Не удалось удалить социальную сеть.")
  }
}).pipe(withStatusesAtom())

export const socialRemoveWrapperAction = reatomAsync(async (ctx, type: PlayerSocialsPayload["type"]) => {
  socialStatusAtom.getOrCreate(ctx, type, () => true)

  try {
    const result = await ctx.schedule(() => socialRemoveAction(ctx, type))
    return { result, type }
  } catch (e) {
    return { type }
  }
}, {
  name: "socialRemoveWrapperAction",
  onFulfill: (ctx, { type, result }) => {
    if (result) {
      if (result.type === type) {
        socialStatusAtom.delete(ctx, type)
      }
    } else {
      socialStatusAtom.delete(ctx, type)
    }
  }
})

export const socialAddSelectedAtom = atom<Nullable<PlayerSocialsPayload["type"]>>(null, "socialAddSelected").pipe(withReset())
export const socialAddIsProcessingAtom = atom(false, "socialAddIsProcessing").pipe(withReset())

export const socialAdd = atom(null, "socialAdd").pipe(
  withAssign((ctx, name) => ({
    selectSocial: action((ctx, social: PlayerSocialsPayload["type"]) => {

      socialAddSelectedAtom(ctx, social)
      socialAddIsProcessingAtom(ctx, true)
    }, `${name}.socialAdd`)
  }))
)