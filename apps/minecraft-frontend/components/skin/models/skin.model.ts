import { getSkinDetails } from "@repo/lib/queries/get-skin-details.ts";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { isParamChanged, requestedUserParamAtom } from "#components/profile/main/models/requested-user.model";

requestedUserParamAtom.onChange((ctx, state) => isParamChanged(ctx, requestedUserParamAtom, state, () => {
  skinStateAction.dataAtom.reset(ctx)
}))

export const skinStateAction = reatomAsync(async (ctx) => {
  const target = ctx.get(requestedUserParamAtom)
  if (!target) return;

  return await ctx.schedule(() => getSkinDetails({ type: "skin", nickname: target }))
}, "skinStateAction").pipe(withDataAtom(), withCache(), withStatusesAtom())