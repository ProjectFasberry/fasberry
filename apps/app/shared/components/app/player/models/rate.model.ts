import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { isIdentityAtom, playerAtom } from "./player.model";
import { currentUserAtom } from "@/shared/models/current-user.model";
import { logError } from "@/shared/lib/log";
import { client, withAbort } from "@/shared/lib/client-wrapper";

export const rateUser = reatomAsync(async (ctx, nickname: string) => {
  if (ctx.get(isIdentityAtom)) return;

  return await ctx.schedule(() =>
    client.post<"rated" | "unrated">(`rate/${nickname}`).exec()
  )
}, {
  name: "rateUser",
  onFulfill: (ctx, res) => {
    if (!res) return null;

    playerAtom(ctx, (state) => {
      if (!state) return null;

      const isRated = res === 'rated'

      const currentCount = state.rate.count
      const count = isRated ? currentCount + 1 : currentCount - 1

      const updated = { rate: { count, isRated } }

      return {
        ...state, rate: { ...state?.rate, ...updated.rate }
      }
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())

type RateList = {
  data: RateUser[];
  meta: number;
}

export type RateUser = {
  initiator: string;
  created_at: string;
}

export const rateListAction = reatomAsync(async (ctx) => {
  const isIdentity = ctx.get(isIdentityAtom);
  if (!isIdentity) return;

  const currentUser = ctx.get(currentUserAtom)
  if (!currentUser) return;

  return await ctx.schedule(() =>
    client<RateList>(`rate/list/${currentUser.nickname}`)
      .pipe(withAbort(ctx.controller.signal))
      .exec()
  )
}, "rateListAction").pipe(withStatusesAtom(), withDataAtom(null), withCache())