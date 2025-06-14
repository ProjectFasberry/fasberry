import { MINECRAFT_SKIN_API } from '@repo/shared/constants/api';
import { action, Atom, atom, Ctx } from "@reatom/core";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { isParamChanged, withHistory } from '@/lib/reatom-helpers';

export const requestedUserParamAtom = atom<string | null>(null, "requestedUserParamAtom").pipe(withHistory())

type GetSkinDetails = {
  type: "head" | "skin"
  nickname: string
}

export async function getSkinDetails({ type, nickname }: GetSkinDetails) {
  const blob = await MINECRAFT_SKIN_API(`get-${type}/${nickname}`).blob()
  return URL.createObjectURL(blob)
}

requestedUserParamAtom.onChange((ctx, state) => isParamChanged(ctx, requestedUserParamAtom, state, () => {
  skinStateAction.dataAtom.reset(ctx)
}))

export const skinHeadAction = reatomAsync(async (ctx) => {
  const target = ctx.get(requestedUserParamAtom)
  if (!target) return;

  return await ctx.schedule(() => getSkinDetails({ type: "head", nickname: target }))
}, "skinHeadAction").pipe(withDataAtom(), withCache(), withStatusesAtom())

export const skinStateAction = reatomAsync(async (ctx) => {
  const target = ctx.get(requestedUserParamAtom)
  if (!target) return;

  skinHeadAction(ctx)
  return await ctx.schedule(() => getSkinDetails({ type: "skin", nickname: target }))
}, "skinStateAction").pipe(withDataAtom(), withCache(), withStatusesAtom())