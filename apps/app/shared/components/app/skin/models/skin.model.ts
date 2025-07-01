import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { isChanged } from '@/shared/lib/reatom-helpers';
import { take } from '@reatom/framework';
import { userParam } from '@/shared/api/global.model';
import { BASE } from '@/shared/api/client';

export async function getSkinDetails({
  type, nickname
}: {
  type: "head" | "skin", nickname: string
}) {
  const blob = await BASE(`server/skin/${nickname}`, {
    searchParams: {
      type: type === 'head' ? "head" : "full"
    }
  }).blob()
  
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