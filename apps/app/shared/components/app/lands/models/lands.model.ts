import { BASE } from "@/shared/api/client";
import { Lands } from "@/shared/components/app/land/models/land.model";
import { reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";

export const landsResource = reatomResource(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await BASE("server/lands", { signal: ctx.controller.signal })

    const data = await res.json<{ data: Lands, meta: PaginatedMeta }>()

    if (!data || 'error' in data) return null

    return data
  })
}).pipe(withDataAtom(), withCache(), withStatusesAtom())