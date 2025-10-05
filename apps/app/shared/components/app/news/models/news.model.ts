import { client } from "@/shared/api/client"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { NewsType } from "../components/news"
import { logError } from "@/shared/lib/log"

type NewsPayload = {
  data: NewsType[], 
  meta: PaginatedMeta
}

export const newsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("shared/news", { throwHttpErrors: false, signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<NewsPayload>>()

    if ("error" in data) throw new Error(data.error)

    return data.data;
  })
}, {
  name: "newsAction",
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withDataAtom(null), withStatusesAtom(), withCache())