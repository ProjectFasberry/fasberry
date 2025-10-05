import { client } from "@/shared/api/client";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { sleep } from "@reatom/framework";
import { Land } from "@repo/shared/types/entities/land";

type LandsPayload = {
  data: Array<Land>, 
  meta: PaginatedMeta
}

export const landsAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(200))

  return await ctx.schedule(async () => {
    const res = await client("server/lands", { signal: ctx.controller.signal, throwHttpErrors: false })
    const data = await res.json<WrappedResponse<LandsPayload>>()

    if ('error' in data) throw new Error(data.error)

    return data.data
  })
}, {
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withDataAtom(null), withCache({ swr: false }), withStatusesAtom())