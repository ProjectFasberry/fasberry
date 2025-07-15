import { client } from "@/shared/api/client"
import { atomHasChanged } from "@/shared/lib/reatom-helpers"
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async"
import { Land } from "@repo/shared/types/entities/land"
import { toast } from "sonner"
import { userParam } from "./player.model"
import { atom } from "@reatom/core"

type UserLands = {
  data: Land[],
  meta: {
    count: number
  }
}

atom((ctx) => {
  atomHasChanged(ctx, userParam, {
    onChange: () => userLands.dataAtom.reset(ctx)
  })
})

export const userLands = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(async () => {
    const res = await client(`server/lands/${nickname}`, { signal: ctx.controller.signal })
    const data = await res.json<UserLands>()

    if ("error" in data) return null;

    return data
  })
}, {
  name: "userLands",
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
}).pipe(withDataAtom(), withStatusesAtom())