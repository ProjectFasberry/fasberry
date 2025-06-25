import { ratingFilterAtom } from "./rating-filter.model";
import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { UnwrapPromise } from "@repo/lib/helpers/unwrap-promise-type";
import { ratingClient } from "@repo/shared/api/minecraft-client";
import type { InferResponseType, InferRequestType } from "hono/client"

type RatingData = UnwrapPromise<ReturnType<typeof getRatings>>["data"]
type RatingMeta = UnwrapPromise<ReturnType<typeof getRatings>>["meta"]

const client = ratingClient.rating["get-rating-by"].$get

export type GetRatingsResponse = InferResponseType<typeof client, 200>

export type GetRatings = InferRequestType<typeof client>["query"]

export const RATINGS_LIMIT = 50;

export async function getRatings({
  type, cursor, ascending
}: Omit<GetRatings, "limit">) {
  const res = await ratingClient.rating["get-rating-by"].$get({
    query: { type, limit: RATINGS_LIMIT.toString(), cursor, ascending }
  })

  const data = await res.json()

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