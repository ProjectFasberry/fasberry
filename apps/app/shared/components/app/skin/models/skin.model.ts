import { MINECRAFT_SKIN_API } from '@repo/shared/constants/api';
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { isChanged } from '@/shared/lib/reatom-helpers';
import { take } from '@reatom/framework';
import { userParam } from '@/shared/api/global.model';

export async function getSkinDetails({
  type, nickname
}: {
  type: "head" | "skin", nickname: string
}) {
  const blob = await MINECRAFT_SKIN_API(`get-${type}/${nickname}`).blob()
  return URL.createObjectURL(blob)
}

userParam.onChange((ctx, state) => {
  console.log("target ->", state)

  isChanged(ctx, userParam, state, () => {
    skinAction.dataAtom.reset(ctx)
  })
})

export const headAction = reatomAsync(async (ctx) => {
  const target = ctx.get(userParam)

  return await ctx.schedule(() => getSkinDetails({ type: "head", nickname: target }))
}, "skinHeadAction").pipe(
  withDataAtom(), withCache(), withStatusesAtom()
)

export const skinAction = reatomAsync(async (ctx) => {
  let target = ctx.get(userParam)

  if (!target) {
    target = await take(ctx, userParam)
  }

  if (!target) return;

  headAction(ctx)

  return await ctx.schedule(() => getSkinDetails({ type: "skin", nickname: target }))
}, "skinStateAction").pipe(
  withDataAtom(), withCache(), withStatusesAtom()
)