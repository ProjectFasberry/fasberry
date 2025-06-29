import ky from 'ky';
import { ratingFilterAtom } from "./rating-filter.model";
import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { createSearchParams } from '@/shared/lib/create-search-params';

type RatingData = any
type RatingMeta = any

export type GetRatingsResponse = { data: RatingData, meta: RatingMeta }

export type GetRatings = {
  type: "playtime" | "charism" | "parkour" | "lands_chunks" | "reputation" | "belkoin",
  cursor?: string,
  ascending: boolean,
  limit?: number
}

export const RATINGS_LIMIT = 50;

export async function getRatings({
  type, cursor, ascending, signal, limit = RATINGS_LIMIT
}: GetRatings & { signal?: AbortSignal }) {
  const searchParams = createSearchParams({ type, limit: limit.toString(), cursor, ascending })

  const res = await ky.get("https://api.fasberry.su/minecrat/ratings/get-rating-by", {
    searchParams,
    throwHttpErrors: false,
    signal
  })

  const data = await res.json<GetRatingsResponse>()

  if ("error" in data) {
    return null
  }

  return data.data.length >= 1 ? data : null
}

export const ratingDataAtom = atom<RatingData | null>(null, "ratingData")
export const ratingMetaAtom = atom<RatingMeta | null>(null, "ratingMeta")

export const ratingAction = reatomAsync(async (ctx, options: Omit<GetRatings, "cursor" | "limit">) => {
  return await ctx.schedule(() => getRatings(options))
}, {
  name: "ratingAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    ratingDataAtom(ctx, res.data)
    ratingMetaAtom(ctx, res.meta)
    ratingFilterAtom(ctx, (state) => ({ ...state, cursor: res.meta?.endCursor }))
  }
}).pipe(withStatusesAtom())