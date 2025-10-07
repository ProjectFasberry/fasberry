import { client } from "@/shared/api/client"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { logError } from "@/shared/lib/log"
import { NewsPayload } from "@repo/shared/types/entities/news"

export async function getNews(init: RequestInit) {
  const res = await client("shared/news/list", { throwHttpErrors: false, ...init })
  const data = await res.json<WrappedResponse<NewsPayload>>()
  if ("error" in data) throw new Error(data.error)
  return data.data;
}

export const newsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => getNews({ signal: ctx.controller.signal }))
}, {
  name: "newsAction",
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withDataAtom(null), withStatusesAtom(), withCache({ swr: false }))