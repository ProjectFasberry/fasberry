import { logError } from "@/shared/lib/log"
import {
  action,
  AsyncCtx,
  atom,
  batch,
  Ctx,
  reatomAsync,
  reatomMap,
  sleep,
  withCache,
  withConcurrency,
  withDataAtom,
  withStatusesAtom
} from "@reatom/framework"
import { NewsPayload } from "@repo/shared/types/entities/news"
import { getNews } from "./news.model"

export const newsAllOldDataAtom = reatomMap<number, NewsPayload["data"][number]>(new Map(), "newsAllOldData")
export const newsAllDataAtom = reatomMap<number, NewsPayload["data"][number]>(new Map(), "newsAllData")
export const newsAllMetaAtom = atom<Nullable<NewsPayload["meta"]>>(null, "newsAllMeta")
export const newsAllDataArrAtom = atom((ctx) => Array.from(ctx.spy(newsAllDataAtom).values()), "newsAllDataArr")

export const newsSearchQueryAtom = atom("", "newsSearchQuery")
export const newsAscAtom = atom(false, "newsAsc")
export const newsIsViewAtom = atom(false, "newsIsView")
export const newsEndCursorAtom = atom<Maybe<string>>(undefined, "newsEndCursor")

newsAscAtom.onChange((ctx) => refetchNewsAll(ctx))

export const onChange = action(async (ctx, e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  newsSearchQueryAtom(ctx, value);

  await ctx.schedule(() => sleep(300))

  refetchNewsAll(ctx)
}, "onChange").pipe(withConcurrency())

function refetchNewsAll(ctx: Ctx) {
  newsAllAction.cacheAtom.reset(ctx)
  newsAllAction(ctx)
}

newsIsViewAtom.onChange((ctx, state) => {
  if (!state) return;

  const meta = ctx.get(newsAllMetaAtom)
  if (!meta) return;

  const hasNextPage = meta?.hasNextPage
  if (!hasNextPage) return;

  batch(ctx, () => {
    newsAllOldDataAtom(ctx, ctx.get(newsAllDataAtom))
    newsEndCursorAtom(ctx, meta.endCursor)
  })

  refetchNewsAll(ctx)
})

function getParams(ctx: Ctx) {
  const opts = {
    asc: ctx.get(newsAscAtom),
    searchQuery: ctx.get(newsSearchQueryAtom),
    endCursor: ctx.get(newsEndCursorAtom)
  }

  return opts
}

async function getAllNews(ctx: AsyncCtx) {
  const opts = getParams(ctx);
  return getNews(ctx, opts)
}

export const newsAllAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => getAllNews(ctx))
}, {
  name: "newsAllAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const fresh = res.data.map(d => [d.id, d] as const);
    const old = ctx.get(newsAllOldDataAtom)

    batch(ctx, () => {
      newsAllDataAtom(ctx, new Map([...old, ...fresh]))
      newsAllMetaAtom(ctx, res.meta)
    })
  },
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(withDataAtom(null), withStatusesAtom(), withCache({ swr: false }))