import { ratingFilterAtom } from "./rating-filter.model";
import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { createSearchParams } from '@/shared/lib/create-search-params';
import { BASE } from '@/shared/api/client';

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

export type RatingDataByKey<K extends keyof RatingMap> = RatingMap[K]

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
  points: number | null;
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

export type GetRatingsResponse = { data: RatingData, meta: RatingMeta }

export type GetRatings = {
  by: keyof RatingMap,
  cursor?: string,
  ascending: boolean,
  limit?: number
}

export async function getRatings({
  by, cursor, ascending, signal, limit = 50
}: GetRatings & { signal?: AbortSignal }) {
  const searchParams = createSearchParams({ by, limit: limit.toString(), cursor, ascending })

  const res = await BASE("server/rating", { searchParams, throwHttpErrors: false, signal })
  const data = await res.json<{ data: RatingData, meta: RatingMeta } | { error: string }>()

  if ("error" in data) return null

  return data.data.length >= 1 ? data : null
}

export const ratingDataAtom = atom<RatingData | null>(null, "ratingData")
export const ratingMetaAtom = atom<RatingMeta | null>(null, "ratingMeta")

export const ratingAction = reatomAsync(async (ctx) => {
  const filter = ctx.get(ratingFilterAtom)

  return await ctx.schedule(() => getRatings(filter))
}, {
  name: "ratingAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    ratingDataAtom(ctx, res.data)
    ratingMetaAtom(ctx, res.meta)
    ratingFilterAtom(ctx, (state) => ({ ...state, cursor: res.meta?.endCursor }))
  }
}).pipe(withStatusesAtom())