import { reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { landsClient } from "@repo/shared/api/minecraft-client";

export async function getLands() {
  const res = await landsClient.lands['get-lands'].$get({ query: { cursor: '' } })
  const data = await res.json()

  if (!data || 'error' in data) return null

  return data
}

export const landsResource = reatomResource(async (ctx) => {
  return await ctx.schedule(() => getLands())
}).pipe(withDataAtom(), withCache(), withStatusesAtom())