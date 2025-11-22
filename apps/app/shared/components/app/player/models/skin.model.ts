import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { getObjectUrl } from "@/shared/lib/volume-helpers";
import { clientInstance } from "@/shared/api/client";

export async function getSkinDetails(
  { type, nickname }: { type: "head" | "skin", nickname: string },
  init?: RequestInit
) {
  const fallback = getObjectUrl(
    "static",
    type === 'skin' ? "steve_skin.png" : "steve_head.png"
  )

  const res = await clientInstance(`server/skin/${type}/${nickname}`, {
    ...init,
    credentials: "omit"
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