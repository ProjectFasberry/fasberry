import { client, withAbort } from "@/shared/lib/client-wrapper";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { sleep } from "@reatom/framework";
import { LandsPayload } from "@repo/shared/types/entities/land";

export const landsAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(160))

  return await ctx.schedule(() =>
    client<LandsPayload>("server/lands/list")
      .pipe(withAbort(ctx.controller.signal))
      .exec()
  )
}, {
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withDataAtom(null), withCache({ swr: false }), withStatusesAtom())