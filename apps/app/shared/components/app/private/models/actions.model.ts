import { client } from "@/shared/api/client"
import { logError } from "@/shared/lib/log"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { atom, batch, Ctx } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { toast } from "sonner"
import { EventPayload } from "../../events/models/events.model"

export const eventTitleAtom = atom("", "eventTitle").pipe(withReset())
export const eventDescriptionAtom = atom("", "eventDescription").pipe(withReset())
export const eventInitiatorAtom = atom("", "eventInitiator").pipe(withReset())
export const eventTypeAtom = atom("", "eventType").pipe(withReset())

function reset(ctx: Ctx) {
  batch(ctx, () => {
    eventTitleAtom.reset(ctx)
    eventDescriptionAtom.reset(ctx)
    eventInitiatorAtom.reset(ctx)
    eventTypeAtom.reset(ctx)
  })
}

export const createEventAction = reatomAsync(async (ctx) => {
  const json = {
    title: ctx.get(eventTitleAtom),
    description: ctx.get(eventDescriptionAtom),
    initiator: ctx.get(eventInitiatorAtom),
    type: ctx.get(eventTypeAtom)
  }

  return await ctx.schedule(async () => {
    const res = await client.post("server/events/create", { json })
    const data = await res.json<WrappedResponse<EventPayload>>()
    if ("error" in data) throw new Error(data.error)
    return data.data;
  })
}, {
  name: "createEventAction",
  onFulfill: (ctx, res) => {
    toast.success("Ивент создан");
    reset(ctx)
  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  },
}).pipe(withStatusesAtom())