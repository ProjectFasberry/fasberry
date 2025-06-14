import { Ex } from "@/components/land/models/land.model";
import { reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { MINECRAFT_LANDS_API } from "@repo/shared/constants/api";

export async function getLands() {
  const res = await MINECRAFT_LANDS_API("get-lands")

  const data = await res.json<{ data: Ex[], meta: { hasNextPage: boolean, endCursor?: string} }>()

  if (!data || 'error' in data) return null

  return data
}

export const landsResource = reatomResource(async (ctx) => {
  return await ctx.schedule(() => getLands())
}).pipe(withDataAtom(), withCache(), withStatusesAtom())