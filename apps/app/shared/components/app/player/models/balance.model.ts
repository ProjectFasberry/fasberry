import { client } from "@/shared/lib/client-wrapper";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withStatusesAtom } from "@reatom/async";
import { atom, batch, Ctx } from "@reatom/core";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { BalancePayload } from "@repo/shared/types/entities/store";

export const charismBalanceAtom = atom(0, "charismBalance")
export const belkoinBalanceAtom = atom(0, "belkoinBalance");

export const balanceTargetServerAtom = atom("bisquite", "balanceTargetServer");

function refetchBalance(ctx: Ctx) {
  balanceAction.cacheAtom.reset(ctx)
  balanceAction(ctx)
}

balanceTargetServerAtom.onChange((ctx) => refetchBalance(ctx))

export const balanceAction = reatomAsync(async (ctx) => {
  const server = ctx.get(balanceTargetServerAtom);

  return await ctx.schedule(() =>
    client<BalancePayload>("server/balance", { searchParams: { server } }).exec()
  )
}, {
  name: "balanceAction",
  onFulfill: async (ctx, res) => {
    const transform = (n: number) => Number(n.toFixed(2))

    batch(ctx, () => {
      charismBalanceAtom(ctx, transform(res.CHARISM))
      belkoinBalanceAtom(ctx, transform(res.BELKOIN))
    })
  },
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(
  withStatusesAtom(),
  withCache({ swr: false })
)

export const animateBalanceAtom = atom(true, "animateBalance").pipe(
  withLocalStorage({ key: "animate-balance" })
)