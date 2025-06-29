import { createSearchParams } from "@/shared/lib/create-search-params"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework";
import { FORUM_SHARED_API } from "@repo/shared/constants/api"
import { z } from 'zod/v4';

export const getNewsSchema = z.object({
  limit: z.string().transform(Number).optional(),
  cursor: z.string().optional(),
  ascending: z.string().transform((val) => val === "true").optional(),
  searchQuery: z.string().optional(),
})

export type News = {
  id: string,
  imageUrl: string,
  created_at: string,
  description: string,
  title: string
}

type NewsMeta = {
  hasNextPage: false,
  hasPrevPage: false,
  endCursor?: string,
  startCursor?: string
}

export type NewsFiltration = z.infer<typeof getNewsSchema> & {
  hasNextPage: boolean
}

const initialNewsFilter = {
  searchQuery: "",
  limit: 12,
  ascending: false,
  hasNextPage: false,
  hasPrevPage: false
}

export const newsFilterAtom = atom<NewsFiltration>(initialNewsFilter, "newsFilter")
export const newsDataAtom = atom<Array<News> | null>(null, "newsData")
export const newsMetaAtom = atom<NewsMeta | null>(null, "newsData")

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
    newsFilterAtom(ctx, { hasNextPage: res.meta?.hasNextPage ?? false })
  }
}).pipe(withStatusesAtom())

export const getNews = async ({
  ascending, cursor, limit, searchQuery
}: z.infer<typeof getNewsSchema>) => {
  const searchParams = createSearchParams({
    ascending: ascending ? ascending.toString() : undefined,
    limit: limit ? limit.toString() : undefined,
    cursor: cursor ? cursor.toString() : undefined,
    searchQuery
  })

  const res = await FORUM_SHARED_API(`get-news`, { searchParams })
  const data = await res.json<{ data: Array<News>, meta: NewsMeta } | { error: string }>()

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

  return await getNews({ ...filtrationData, ...values })
}, {
  onFulfill: (ctx, res) => {
    if (!res) {
      return
    }

    newsDataAtom(ctx, res.data)
    newsMetaAtom(ctx, res.meta)
  }
})