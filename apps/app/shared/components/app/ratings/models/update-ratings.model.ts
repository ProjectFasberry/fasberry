import { reatomAsync, withStatusesAtom } from "@reatom/async"
import {
  getRatingsFn,
  ratingByAtom,
  ratingDataAtom,
  ratingMetaAtom,
  resetRatings
} from "./ratings.model"
import { logError } from "@/shared/lib/log"
import { AtomState, batch } from "@reatom/core"
import { sleep } from "@reatom/framework"

export const updateRatingAction = reatomAsync(async (ctx, target: AtomState<typeof ratingByAtom>, type: "update-filter" | "update-cursor") => {
  if (type === 'update-filter') {
    batch(ctx, () => {
      resetRatings(ctx);
      ratingByAtom(ctx, target);
    })

    await ctx.schedule(() => sleep(200))
  }

  const result = await ctx.schedule(() => getRatingsFn(ctx))

  return { type, target, result };
}, {
  name: "updateRatingAction",
  onFulfill: (ctx, { type, target: by, result }) => {
    if (!result) return;

    if (type === "update-filter") {
      batch(ctx, () => {
        ratingDataAtom(ctx, result.data)
        ratingMetaAtom(ctx, result.meta)
      })

      return;
    }

    batch(ctx, () => {
      // @ts-expect-error
      ratingDataAtom(ctx, (state) => {
        if (!state || !state.length) return result.data;

        type IdentifierKeyLiteral = 'nickname' | 'player' | 'land';
        type RatingTypeKey = 'playtime' | 'parkour' | 'charism' | 'belkoin' | 'reputation' | 'lands_chunks';

        const keyMap: ReadonlyMap<RatingTypeKey, IdentifierKeyLiteral> = new Map([
          ['playtime', 'nickname'],
          ['charism', 'nickname'],
          ['belkoin', 'nickname'],
          ['reputation', 'nickname'],
          ['parkour', 'player'],
          ['lands_chunks', 'land'],
        ]);

        const identifierKey = keyMap.get(by);

        if (!identifierKey) {
          console.warn(`Unknown rating type: ${by}`);
          return state;
        }

        if (!Array.isArray(result.data)) {
          console.error('result.data is not an array:', result.data);
          return state;
        }

        const prev = state
        const target = result.data

        const newRating = target.filter(m =>
          // @ts-expect-error
          !prev.some(exist => exist[identifierKey] === m[identifierKey])
        );

        return [...prev, ...newRating];
      })

      ratingMetaAtom(ctx, result.meta);
    })
  },
  onReject: (_, e) => {
    logError(e)
  },
}).pipe(withStatusesAtom())