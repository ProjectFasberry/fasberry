import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { StatusPayload } from "@repo/shared/types/entities/other"

export const serverStatusAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<StatusPayload>("server/status", { throwHttpErrors: false })
      .pipe(withQueryParams({ type: "servers" }), withAbort(ctx.controller.signal))
      .exec()
  )
}, "serverStatusAction").pipe(withStatusesAtom(), withCache(), withDataAtom(null))