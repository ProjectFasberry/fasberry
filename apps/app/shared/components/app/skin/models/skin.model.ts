import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { isChanged } from '@/shared/lib/reatom-helpers';
import { take } from '@reatom/framework';
import { userParam } from '@/shared/api/global.model';
import { getObjectUrl } from "@/shared/lib/volume-helpers";
import { BASE } from "@/shared/api/client";

userParam.onChange((ctx, state) => {
  console.log("target ->", state)

  isChanged(ctx, userParam, state, () => {
    skinAction.dataAtom.reset(ctx)
  })
})

export async function getSkinDetails({
  type, nickname
}: {
  type: "head" | "skin", nickname: string
}) {
  const fallback = getObjectUrl(
    "static",
    type === 'skin' ? "steve_skin.png" : "steve_head.png"
  )

  const res = await BASE(`server/skin/${nickname}`, {
    searchParams: {
      type: type === 'head' ? "head" : "full"
    }
  })

  if (!res.ok) {
    return fallback
  }

  const data = await res.text()

  return data
}

export const skinAction = reatomAsync(async (ctx) => {
  let target = ctx.get(userParam)

  if (!target) {
    target = await take(ctx, userParam)
  }

  if (!target) return;

  return await ctx.schedule(() => getSkinDetails({ type: "skin", nickname: target }))
}, "skinStateAction").pipe(
  withDataAtom(), withCache(), withStatusesAtom()
)