import { isEmptyArray } from "@/shared/lib/array";
import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { EventPayload } from "@repo/shared/types/entities/other";

const eventsTypeAtom = atom<Maybe<string>>(undefined, "eventsType")

export const eventsAction = reatomAsync(async (ctx) => {
  const opts = {
    type: ctx.get(eventsTypeAtom)
  }

  return await ctx.schedule(() =>
    client<EventPayload[]>("server/events/list")
      .pipe(withQueryParams(opts), withAbort(ctx.controller.signal))
      .exec()
  )
}, "eventsAction").pipe(
  withDataAtom(null, (ctx, data) => isEmptyArray(data) ? null : data), 
  withCache({ swr: false, staleTime: 1 * 60 * 1000 }), 
  withStatusesAtom()
)