import { BASE } from "@/shared/api/client";
import { createSearchParams } from "@/shared/lib/create-search-params"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework";
import { z } from 'zod';

export const getNewsSchema = z.object({
  limit: z.string().transform((val) => Number(val)).optional(),
  cursor: z.string().optional(),
  ascending: z.string().transform((val) => val === "true").optional(),
  search: z.string().optional(),
})

export type News = {
  id: string,
  title: string
  created_at: string,
  description: string,
  imageUrl: string,
  views: number
}

export type NewsFiltration = z.infer<typeof getNewsSchema>

const initialNewsFilter = {
  search: "",
  ascending: false,
  hasNextPage: false,
  hasPrevPage: false
}

export const newsFilterAtom = atom<NewsFiltration>(initialNewsFilter, "newsFilter")
export const newsDataAtom = atom<Array<News> | null>(null, "newsData")
export const newsMetaAtom = atom<PaginatedMeta | null>(null, "newsData")

export const newsAction = reatomAsync(async (ctx, values: z.infer<typeof getNewsSchema>) => {
  if (ctx.get(newsDataAtom)) return {
    data: ctx.get(newsDataAtom),
    meta: ctx.get(newsMetaAtom)
  }

  return await ctx.schedule(() => getNews(values))
}, {
  name: "newsAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    newsDataAtom(ctx, res.data)
    newsMetaAtom(ctx, res.meta)
  }
}).pipe(withStatusesAtom())

export const getNews = async ({ ascending, limit, cursor, search, signal }: z.infer<typeof getNewsSchema> & { signal?: AbortSignal }) => {
  const searchParams = createSearchParams({
    limit: limit ? limit.toString() : undefined,
    ascending: ascending ? ascending.toString() : undefined,
    cursor: cursor ? cursor.toString() : undefined,
    search
  })

  const res = await BASE(`shared/news`, { searchParams, signal })
  const data = await res.json<{ data: Array<News>, meta: PaginatedMeta } | { error: string }>()

  if ("error" in data) return null

  return data;
}

export const selectedNews = atom<News | null>(null, "selectedNews").pipe(withReset())
export const newsDialogIsOpen = atom(false, "newsDialogIsOpen")

export const openNewsDialog = action((ctx, values: News) => {
  selectedNews(ctx, values)
  newsDialogIsOpen(ctx, true)
})

newsDialogIsOpen.onChange(async (ctx, target) => {
  if (!target) {
    await sleep(200)
    selectedNews.reset(ctx)
  }
})

export const updateNewsAction = reatomAsync(async (ctx, values: Partial<NewsFiltration>) => {
  newsFilterAtom(ctx, (state) => ({ ...state, ...values }))

  const filtrationData = ctx.get(newsFilterAtom)

  return await getNews({ ...filtrationData, ...values, signal: ctx.controller.signal })
}, {
  onFulfill: (ctx, res) => {
    if (!res) {
      return
    }

    newsDataAtom(ctx, res.data)
    newsMetaAtom(ctx, res.meta)
  }
}).pipe(withStatusesAtom())