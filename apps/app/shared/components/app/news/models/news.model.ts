import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { logError } from "@/shared/lib/log"
import { NewsPayload } from "@repo/shared/types/entities/news"
import { client } from "@/shared/lib/client-wrapper"

export async function getNews(init: RequestInit) {
  return client<NewsPayload>("shared/news/list", { ...init, throwHttpErrors: false }).exec()
}

export const newsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => getNews({ signal: ctx.controller.signal }))
}, {
  name: "newsAction",
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withDataAtom(null), withStatusesAtom(), withCache({ swr: false }))