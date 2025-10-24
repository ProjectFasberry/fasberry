import { client } from "@/shared/lib/client-wrapper";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withStatusesAtom } from "@reatom/async";
import { atom, batch } from "@reatom/core";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { BalancePayload } from "@repo/shared/types/entities/store";

export const charismBalanceAtom = atom(0, "charismBalance")
export const belkoinBalanceAtom = atom(0, "belkoinBalance");

function transform(n: number) {
  return Number(n.toFixed(2))
}

export const balanceAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<BalancePayload>("server/balance").exec()
  )
}, {
  name: "balanceAction",
  onFulfill: async (ctx, res) => {
    batch(ctx, () => {
      charismBalanceAtom(ctx, transform(res.CHARISM))
      belkoinBalanceAtom(ctx, transform(res.BELKOIN))
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom(), withCache({ swr: false }))

export const animateBalanceAtom = atom(true, "animateBalance").pipe(
  withLocalStorage({ key: "animate-balance" })
)
