import { AsyncCtx, reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom, batch, Ctx } from "@reatom/core";
import { createSearchParams } from '@/shared/lib/create-search-params';
import { client } from '@/shared/api/client';
import { withReset } from "@reatom/framework";
import { withHistory } from "@/shared/lib/reatom-helpers";
import { logError } from "@/shared/lib/log";

export type RatingData =
  | RatingPlaytime[]
  | RatingLands[]
  | RatingReputation[]
  | RatingCharism[]
  | RatingBelkoin[]
  | RatingParkour[]

type RatingMeta = {
  hasNextPage: boolean,
  startCursor?: string,
  endCursor?: string,
  hasPrevPage: boolean
}

type RatingMap = {
  playtime: RatingPlaytime[]
  lands_chunks: RatingLands[]
  reputation: RatingReputation[]
  charism: RatingCharism[]
  belkoin: RatingBelkoin[]
  parkour: RatingParkour[]
}

export type RatingPlaytime = {
  total: number;
  nickname: string;
}

export type RatingParkour = {
  gamesplayed: number | null
  player: string | null,
  score: number | null;
  area: string | null;
  nickname: string | null;
}

export type RatingBelkoin = {
  nickname: string;
  balance: number
}

export type RatingCharism = {
  balance: number;
  nickname: string;
}

export type RatingReputation = {
  reputation: number;
  uuid: string;
  nickname: string;
}

export type RatingLands = {
  land: string;
  chunks_amount: number;
  members: {
    [key: string]: {
      chunks: number;
    }
  };
  name: string;
  type: string;
  blocks: any
}

export type RatingsPayload = {
  data: RatingData,
  meta: RatingMeta
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

export const ratingDataAtom = atom<RatingData | null>(null, "ratingData").pipe(withReset())
export const ratingMetaAtom = atom<RatingMeta | null>(null, "ratingMeta").pipe(withReset())

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