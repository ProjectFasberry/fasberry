import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { EventPayload } from "@repo/shared/types/entities/other";

const eventsTypeAtom = atom<string | undefined>(undefined, "eventsType")

export const eventsAction = reatomAsync(async (ctx) => {
  const opts = {
    type: ctx.get(eventsTypeAtom)
  }

  return await ctx.schedule(() =>
    client<EventPayload[]>("server/events/list")
      .pipe(withQueryParams(opts), withAbort(ctx.controller.signal))
      .exec()
  )
}, "eventsAction").pipe(withDataAtom([]), withStatusesAtom())