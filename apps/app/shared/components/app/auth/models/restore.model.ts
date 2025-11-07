import { client, withJsonBody } from "@/shared/lib/client-wrapper";
import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { withAssign } from "@reatom/framework";

export const restore = atom(null, "restore").pipe(
  withAssign((ctx, name) => ({
    
  }))
)

export const restoreAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => 
    client.post("auth/restore").pipe(withJsonBody({})).exec()
  )
}, {
  name: "restoreAction",
  onFulfill: (ctx, res) => {

  },
  onReject: (ctx, e) => {

  }
}).pipe(withStatusesAtom())