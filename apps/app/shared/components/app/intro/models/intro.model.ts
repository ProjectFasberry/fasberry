import { client } from "@/shared/api/client";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { StatusPayload } from "@repo/shared/types/entities/other"

export const serverStatusAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("server/status", {
      searchParams: { type: "servers" }, signal: ctx.controller.signal, throwHttpErrors: false
    })

    const data = await res.json<WrappedResponse<StatusPayload>>()

    if ("error" in data) throw new Error(data.error);

    return data.data
  })
}, "serverStatusAction").pipe(withStatusesAtom(), withCache(), withDataAtom(null))