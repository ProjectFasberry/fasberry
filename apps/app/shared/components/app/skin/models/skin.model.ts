import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { getObjectUrl } from "@/shared/lib/volume-helpers";
import { client } from "@/shared/api/client";
import { userParamAtom } from "../../player/models/player.model";

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

  if (!res.ok) {
    return fallback
  }

  const data = await res.text()

  return data
}

export const skinAction = reatomAsync(async (ctx) => {
  const nickname = ctx.get(userParamAtom)
  if (!nickname) return null;

  return await ctx.schedule(() => getSkinDetails({ type: "skin", nickname }, { signal: ctx.controller.signal }))
}, "skinAction").pipe(withDataAtom(null), withCache(), withStatusesAtom())