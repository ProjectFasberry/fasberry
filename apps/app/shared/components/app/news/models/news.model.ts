import { reatomAsync, withCache, withStatusesAtom } from "@reatom/async"
import { logError } from "@/shared/lib/log"
import { News, NewsPayload } from "@repo/shared/types/entities/news"
import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper"
import { atom, batch } from "@reatom/core";
import { withSsr } from "@/shared/lib/ssr";
import { withReset } from "@reatom/framework";
import { isEmptyArray } from "@/shared/lib/array";

export const newsDataAtom = atom<NewsPayload["data"] | null>(null).pipe(withReset());
export const newsMetaAtom = atom<NewsPayload["meta"] | null>(null).pipe(withReset())

export async function getNews(init: RequestInit, params: Partial<{ limit: number, asc: boolean }>) {
  return client<NewsPayload>("shared/news/list", { throwHttpErrors: false })
    .pipe(withQueryParams(params), withAbort(init.signal))
    .exec()
}

export const newsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => getNews({ signal: ctx.controller.signal }, { limit: 3, asc: false }))
}, {
  name: "newsAction",
  onFulfill: (ctx, { data, meta }) => {
    batch(ctx, () => {
      newsDataAtom(ctx, isEmptyArray(data) ? null : data);
      newsMetaAtom(ctx, meta)
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom(), withCache({ swr: false }))

export const newsItemAtom = atom<News | null>(null, "newsItem").pipe(withSsr("news-item"))