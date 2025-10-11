import { client } from "@/shared/lib/client-wrapper";
import { logError } from "@/shared/lib/log";
import { reatomAsync } from "@reatom/async";
import { atom, batch } from "@reatom/core";
import { BalancePayload } from "@repo/shared/types/entities/store";

export const charismBalanceAtom = atom(0, "charismBalance")
export const belkoinBalanceAtom = atom(0, "belkoinBalance");

export const financeAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => 
    client<BalancePayload>("server/balance").exec()
  )
}, {
  name: "financeAction",
  onFulfill: async (ctx, res) => {
    batch(ctx, () => {
      charismBalanceAtom(ctx, res.CHARISM)
      belkoinBalanceAtom(ctx, res.BELKOIN)
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
})