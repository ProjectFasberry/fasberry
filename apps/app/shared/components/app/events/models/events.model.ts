import { client } from "@/shared/api/client";
import { createSearchParams } from "@/shared/lib/create-search-params";
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { EventPayload } from "@repo/shared/types/entities/other";

const eventsTypeAtom = atom<string | undefined>(undefined, "eventsType")

export const eventsAction = reatomAsync(async (ctx) => {
  const opts = {
    type: ctx.get(eventsTypeAtom)
  }
  
  const searchParams = createSearchParams(opts)

  return await ctx.schedule(async () => {
    const res = await client("server/events/list", { searchParams, signal: ctx.controller.signal });
    const data = await res.json<WrappedResponse<EventPayload[]>>();
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, "eventsAction").pipe(withDataAtom([]), withStatusesAtom())