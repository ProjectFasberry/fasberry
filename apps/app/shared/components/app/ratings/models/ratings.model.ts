import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { atom, batch, Ctx } from "@reatom/core";
import { sleep, withReset } from "@reatom/framework";
import { withHistory } from "@/shared/lib/reatom-helpers";
import { logError } from "@/shared/lib/log";
import {
  RatingBelkoin,
  RatingCharism,
  RatingLands,
  RatingParkour,
  RatingPlaytime,
  RatingReputation,
  RatingsPayload
} from "@repo/shared/types/entities/rating"
import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";
import { DEFAULT_SOFT_TIMEOUT } from "@/shared/consts/delays";

type RatingMap = {
  playtime: RatingPlaytime[]
  lands_chunks: RatingLands[]
  reputation: RatingReputation[]
  charism: RatingCharism[]
  belkoin: RatingBelkoin[]
  parkour: RatingParkour[]
}

type Options = {
  endCursor?: string,
  asc: boolean,
  limit?: number
}

export async function getRatings(
  by: keyof RatingMap,
  { endCursor, asc, limit = 50 }: Options,
  init: RequestInit
) {
  const opts = { limit, endCursor, asc }

  return client<RatingsPayload>(`server/rating/${by}`, { ...init, retry: 1, throwHttpErrors: false })
    .pipe(withQueryParams(opts), withAbort(init.signal))
    .exec()
}

export const ratingDataAtom = atom<RatingsPayload["data"] | null>(null, "ratingData").pipe(withReset())
export const ratingMetaAtom = atom<RatingsPayload["meta"] | null>(null, "ratingMeta").pipe(withReset())

export const ratingByAtom = atom<keyof RatingMap>("playtime", "ratingBy").pipe(withHistory(1))
export const ratingAscAtom = atom(false, "ratingAsc")
export const ratingEndCursorAtom = atom<Maybe<string>>(undefined, "ratingEndCursor").pipe(withReset())

ratingByAtom.onChange((ctx) => {
  updateRatingAction(ctx)
})

export function resetRatings(ctx: Ctx) {
  batch(ctx, () => {
    ratingMetaAtom.reset(ctx)
    ratingDataAtom.reset(ctx)
  })
}

function getParams(ctx: Ctx) {
  const opts = {
    asc: ctx.get(ratingAscAtom),
    cursor: ctx.get(ratingEndCursorAtom)
  }

  const by = ctx.get(ratingByAtom)

  return { by, opts }
}

export const ratingsAction = reatomAsync(async (ctx) => {
  const { opts, by } = getParams(ctx)

  return await ctx.schedule(() =>
    getRatings(by, opts, { signal: ctx.controller.signal })
  )
}, {
  name: "ratingsAction",
  onFulfill: (ctx, res) => {
    batch(ctx, () => {
      ratingDataAtom(ctx, res.data)
      ratingMetaAtom(ctx, res.meta)
    })
  },
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())

export const updateRatingAction = reatomAsync(async (ctx) => {
  const { by, opts } = getParams(ctx);

  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT))

  return await ctx.schedule(() =>
    getRatings(by, opts, { signal: ctx.controller.signal })
  )
}, {
  name: "updateRatingAction",
  onFulfill: (ctx, result) => {
    batch(ctx, () => {
      ratingDataAtom(ctx, result.data)
      ratingMetaAtom(ctx, result.meta)
    })

    // batch(ctx, () => {
    //   // @ts-expect-error
    //   ratingDataAtom(ctx, (state) => {
    //     if (!state || !state.length) return result.data;

    //     type IdentifierKeyLiteral = 'nickname' | 'player' | 'land';
    //     type RatingTypeKey = 'playtime' | 'parkour' | 'charism' | 'belkoin' | 'reputation' | 'lands_chunks';

    //     const keyMap: ReadonlyMap<RatingTypeKey, IdentifierKeyLiteral> = new Map([
    //       ['playtime', 'nickname'],
    //       ['charism', 'nickname'],
    //       ['belkoin', 'nickname'],
    //       ['reputation', 'nickname'],
    //       ['parkour', 'player'],
    //       ['lands_chunks', 'land'],
    //     ]);

    //     const identifierKey = keyMap.get(by);

    //     if (!identifierKey) {
    //       console.warn(`Unknown rating type: ${by}`);
    //       return state;
    //     }

    //     if (!Array.isArray(result.data)) {
    //       console.error('result.data is not an array:', result.data);
    //       return state;
    //     }

    //     const prev = state
    //     const target = result.data

    //     const newRating = target.filter(m =>
    //       // @ts-expect-error
    //       !prev.some(exist => exist[identifierKey] === m[identifierKey])
    //     );

    //     return [...prev, ...newRating];
    //   })

    //   ratingMetaAtom(ctx, result.meta);
    // })
  },
  onReject: (_, e) => {
    logError(e)
  },
}).pipe(withStatusesAtom())

export const ratingIsViewAtom = atom(false, "ratingIsView")

ratingIsViewAtom.onChange((ctx, state) => {
  if (!state) return;

  const meta = ctx.get(ratingMetaAtom)
  const hasMore = meta?.hasNextPage;

  if (hasMore) {
    ratingEndCursorAtom(ctx, meta.endCursor);
    updateRatingAction(ctx)
  }
})