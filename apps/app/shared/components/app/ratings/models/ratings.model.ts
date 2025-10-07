import { AsyncCtx, reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom, batch, Ctx } from "@reatom/core";
import { createSearchParams } from '@/shared/lib/create-search-params';
import { client } from '@/shared/api/client';
import { withReset } from "@reatom/framework";
import { withHistory } from "@/shared/lib/reatom-helpers";
import { logError } from "@/shared/lib/log";
import { RatingBelkoin, RatingCharism, RatingLands, RatingParkour, RatingPlaytime, RatingReputation, RatingsPayload  } from "@repo/shared/types/entities/rating"

type RatingMap = {
  playtime: RatingPlaytime[]
  lands_chunks: RatingLands[]
  reputation: RatingReputation[]
  charism: RatingCharism[]
  belkoin: RatingBelkoin[]
  parkour: RatingParkour[]
}

type Options = {
  cursor?: string,
  ascending: boolean,
  limit?: number
}

export async function getRatings(
  by: keyof RatingMap,
  { cursor, ascending, limit = 50 }: Options,
  init?: RequestInit
) {
  const searchParams = createSearchParams({ by, limit, cursor, ascending })

  const res = await client("server/rating", { searchParams, retry: 1, throwHttpErrors: false, ...init })
  const data = await res.json<WrappedResponse<RatingsPayload>>()
  if ("error" in data) throw new Error(data.error)
  return data.data
}

export const ratingDataAtom = atom<RatingsPayload["data"] | null>(null, "ratingData").pipe(withReset())
export const ratingMetaAtom = atom<RatingsPayload["meta"] | null>(null, "ratingMeta").pipe(withReset())

export const ratingByAtom = atom<keyof RatingMap>("playtime", "ratingBy").pipe(withHistory(1))
export const ratingFilterAtom = atom<{ ascending: boolean }>({ ascending: false }, "ratingFilter")

export function resetRatings(ctx: Ctx) {
  batch(ctx, () => {
    ratingMetaAtom.reset(ctx)
    ratingDataAtom.reset(ctx)
  })
}

export async function getRatingsFn(ctx: AsyncCtx) {
  const opts = ctx.get(ratingFilterAtom)
  const by = ctx.get(ratingByAtom)

  return getRatings(by, opts, { signal: ctx.controller.signal })
}

export const ratingsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => getRatingsFn(ctx))
}, {
  name: "ratingsAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    batch(ctx, () => {
      ratingDataAtom(ctx, res.data)
      ratingMetaAtom(ctx, res.meta)
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())