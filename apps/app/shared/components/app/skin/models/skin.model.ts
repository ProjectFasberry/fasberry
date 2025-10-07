import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { getObjectUrl } from "@/shared/lib/volume-helpers";
import { client } from "@/shared/api/client";

export async function getSkinDetails(
  { type, nickname }: { type: "head" | "skin", nickname: string },
  init?: RequestInit
) {
  const fallback = getObjectUrl(
    "static",
    type === 'skin' ? "steve_skin.png" : "steve_head.png"
  )

  const res = await client(`server/skin/${nickname}`, {
    searchParams: {
      type: type === 'head' ? "head" : "full"
    },
    ...init
  })

  if (!res.ok) return fallback;

  const data = await res.text()
  return data
}

export const skinAction = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(() => getSkinDetails(
    { type: "skin", nickname }, 
    { signal: ctx.controller.signal })
  )
}, "skinAction").pipe(withDataAtom(null), withCache({ swr: false }), withStatusesAtom())