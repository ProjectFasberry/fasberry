import { BASE } from "@/shared/api/client"
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async"
import { sleep } from "@reatom/framework"
import { News } from "../components/news"

export const newsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    await sleep(100)

    const res = await BASE("shared/news", { throwHttpErrors: false, signal: ctx.controller.signal })
    const data = await res.json<{ data: News[], meta: PaginatedMeta } | { error: string }>()

    if ("error" in data) {
      return null;
    }

    return data.data;
  })
}).pipe(withDataAtom(), withStatusesAtom())