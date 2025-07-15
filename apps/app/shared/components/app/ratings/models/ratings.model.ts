import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { createSearchParams } from '@/shared/lib/create-search-params';
import { client } from '@/shared/api/client';
import { withReset } from "@reatom/framework";
import { withHistory } from "@/shared/lib/reatom-helpers";

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

export type GetRatingsResponse = { data: RatingData, meta: RatingMeta }

export type GetRatings = {
  by: keyof RatingMap,
  cursor?: string,
  ascending: boolean,
  limit?: number
}

export async function getRatings({
  by, cursor, ascending, signal, limit = 50
}: GetRatings & RequestInit) {
  const searchParams = createSearchParams({ by, limit: limit.toString(), cursor, ascending })

  const res = await client("server/rating", { searchParams, throwHttpErrors: false, signal })
  const data = await res.json<{ data: RatingData, meta: RatingMeta } | { error: string }>()

  if ("error" in data) return null

  return data.data.length >= 1 ? data : null
}

export const ratingDataAtom = atom<RatingData | null>(null, "ratingData").pipe(withReset())
export const ratingMetaAtom = atom<RatingMeta | null>(null, "ratingMeta").pipe(withReset())

export const ratingByAtom = atom<GetRatings["by"]>("playtime", "ratingBy").pipe(withHistory(1))
export const ratingFilterAtom = atom<{ ascending: boolean }>({ ascending: false }, "ratingFilter")

ratingByAtom.onChange((ctx, target) => {
  const prev = ctx.get(ratingByAtom.history)[1]

  if (prev !== target) {
    ratingMetaAtom.reset(ctx)
    ratingDataAtom.reset(ctx)
  }
})

export const ratingAction = reatomAsync(async (ctx) => {
  const filter = ctx.get(ratingFilterAtom)
  const by = ctx.get(ratingByAtom)

  return await ctx.schedule(() => getRatings({ ...filter, by }))
}, {
  name: "ratingAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    ratingDataAtom(ctx, res.data)
    ratingMetaAtom(ctx, res.meta)
  }
}).pipe(withStatusesAtom())