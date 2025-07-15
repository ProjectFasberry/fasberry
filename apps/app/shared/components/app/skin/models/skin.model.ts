import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atomHasChanged } from '@/shared/lib/reatom-helpers';
import { atom, take } from '@reatom/framework';
import { getObjectUrl } from "@/shared/lib/volume-helpers";
import { client } from "@/shared/api/client";
import { userParam } from "../../player/models/player.model";

atom((ctx) => {
  atomHasChanged(ctx, userParam, {
    onChange: () => skinAction.dataAtom.reset(ctx)
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

  const res = await client(`server/skin/${nickname}`, {
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