import { client } from "@/shared/api/client";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { isIdentityAtom, targetUserAtom } from "./player.model";
import { currentUserAtom } from "@/shared/models/current-user.model";
import { logError } from "@/shared/lib/log";

export const rateUser = reatomAsync(async (ctx, target: string) => {
  if (ctx.get(isIdentityAtom)) return;

  return await ctx.schedule(async () => {
    const res = await client.post(`rate/${target}`, { throwHttpErrors: false })
    const data = await res.json<WrappedResponse<"rated" | "unrated">>()

    if ("error" in data) throw new Error(data.error)
  
    return data.data
  })
}, {
  name: "rateUser",
  onFulfill: (ctx, res) => {
    if (!res) return null;

    targetUserAtom(ctx, (state) => {
      if (!state) return null;

      const isRated = res === 'rated'

      const currentCount = state.details.rate.count
      const count = isRated ? currentCount + 1 : currentCount - 1

      const updated = { rate: { count, isRated } }

      return {
        ...state, details: { ...state?.details, ...updated }
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

  return await ctx.schedule(async () => {
    const res = await client(`rates/${currentUser.nickname}`, {
      signal: ctx.controller.signal, throwHttpErrors: false
    })

    const data = await res.json<WrappedResponse<RateList>>()

    if ("error" in data) throw new Error(data.error)

    return data.data;
  })
}, "rateListAction").pipe(withStatusesAtom(), withDataAtom(null), withCache())