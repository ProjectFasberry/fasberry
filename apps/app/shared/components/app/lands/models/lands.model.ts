import { client } from "@/shared/api/client";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { sleep } from "@reatom/framework";
import { LandsPayload } from "@repo/shared/types/entities/land";

export const landsAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(160))

  return await ctx.schedule(async () => {
    const res = await client("server/lands/list", { signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<LandsPayload>>()
    if ('error' in data) throw new Error(data.error)
    return data.data
  })
}, {
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withDataAtom(null), withCache({ swr: false }), withStatusesAtom())