import { BASE } from "@/shared/api/client";
import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { toast } from "sonner";
import { isIdentityAtom, targetUserAtom } from "./player.model";

export const rateUser = reatomAsync(async (ctx, target: string) => {
  if (ctx.get(isIdentityAtom)) return;

  return await ctx.schedule(async () => {
    const res = await BASE.post(`rate/${target}`, { throwHttpErrors: false, signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<"rated" | "unrated">>()

    if ("error" in data) {
      return null;
    }

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
    if (e instanceof Error) toast.error(e.message)
  }
}).pipe(withStatusesAtom())