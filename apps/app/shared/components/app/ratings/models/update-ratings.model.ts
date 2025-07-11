import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { getRatings, RatingBelkoin, RatingCharism, ratingDataAtom, RatingLands, ratingMetaAtom, RatingParkour, RatingPlaytime, RatingReputation } from "./ratings.model"
import { ratingByAtom, ratingFilterAtom } from "./rating-filter.model"
import { toast } from "sonner"

const updateRatingActionVariablesAtom = atom<"update-filter" | "update-cursor" | null>(null, "updateRatingVariables")

// todo: destructure onFulfill result;

export const updateRatingAction = reatomAsync(async (ctx, type: "update-filter" | "update-cursor") => {
  updateRatingActionVariablesAtom(ctx, type)
  
  const filtering = ctx.get(ratingFilterAtom)
  const prevCursor = ctx.get(ratingMetaAtom)?.endCursor
  const cursor = type === 'update-filter' ? undefined : prevCursor
  const by = ctx.get(ratingByAtom)

  return await ctx.schedule(() => getRatings({ ...filtering, cursor, by }))
}, {
  name: "updateRatingAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const variables = ctx.get(updateRatingActionVariablesAtom)
    if (!variables) return

    if (variables === "update-filter") {
      ratingDataAtom(ctx, res.data)
      ratingMetaAtom(ctx, res.meta)
      return;
    }

    const by = ctx.get(ratingByAtom);

    ratingMetaAtom(ctx, res.meta)
    ratingDataAtom(ctx, (state) => {
      if (!state || !state.length) return res.data;

      if (by === 'playtime') {
        const target = res.data as RatingPlaytime[]
        const prev = state as RatingPlaytime[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )
        
        return [...prev, ...newRating]
      }

      if (by === 'parkour') {
        const target = res.data as RatingParkour[]
        const prev = state as RatingParkour[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.player === m.player)
        )

        return [...prev, ...newRating]
      }

      if (by === 'charism') {
        const target = res.data as RatingCharism[]
        const prev = state as RatingCharism[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )

        return [...prev, ...newRating]
      }

      if (by === 'belkoin') {
        const target = res.data as RatingBelkoin[]
        const prev = state as RatingBelkoin[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )

        return [...prev, ...newRating]
      }

      if (by === 'reputation') {
        const target = res.data as RatingReputation[]
        const prev = state as RatingReputation[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )
        
        return [...prev, ...newRating]
      }

      if (by === 'lands_chunks') {
        const target = res.data as RatingLands[]
        const prev = state as RatingLands[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.land === m.land)
        )

        return [...prev, ...newRating]
      }

      return state;
    })
  },
  onReject: (ctx, e) => {
    if (e instanceof Error) toast.error(e.message)
  },
}).pipe(withStatusesAtom())