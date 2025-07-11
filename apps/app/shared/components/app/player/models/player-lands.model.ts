import { BASE } from "@/shared/api/client"
import { isChanged } from "@/shared/lib/reatom-helpers"
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async"
import { Land } from "@repo/shared/types/entities/land"
import { toast } from "sonner"
import { userParam } from "./player.model"

type UserLands = {
  data: Land[],
  meta: {
    count: number
  }
}

export const userLands = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(async () => {
    const res = await BASE(`server/lands/${nickname}`, { signal: ctx.controller.signal })
    const data = await res.json<UserLands>()

    if ("error" in data) return null;

    return data
  })
}, {
  name: "userLands",
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
}).pipe(withDataAtom(), withStatusesAtom())

userParam.onChange((ctx, state) => {
  isChanged(ctx, userParam, state, () => {
    userLands.dataAtom.reset(ctx)
  })
})
