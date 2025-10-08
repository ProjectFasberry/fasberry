import { client } from "@/shared/api/client";
import { logError } from "@/shared/lib/log";
import { reatomAsync } from "@reatom/async";
import { atom, batch } from "@reatom/core";

export const charismBalanceAtom = atom(0, "charismBalance")
export const belkoinBalanceAtom = atom(0, "belkoinBalance");

export const financeAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("server/balance");
    const data = await res.json<WrappedResponse<{ charism: number, belkoin: number }>>();
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, {
  name: "financeAction",
  onFulfill: (ctx, res) => {
    batch(ctx, () => {
      charismBalanceAtom(ctx, res.charism)
      belkoinBalanceAtom(ctx, res.belkoin)
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
})