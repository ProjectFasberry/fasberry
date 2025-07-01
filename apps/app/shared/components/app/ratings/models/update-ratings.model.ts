import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { getRatings, RatingBelkoin, RatingCharism, ratingDataAtom, RatingLands, ratingMetaAtom, RatingParkour, RatingPlaytime, RatingReputation } from "./ratings.model"
import { ratingFilterAtom } from "./rating-filter.model"
import { toast } from "sonner"

const updateRatingActionVariablesAtom = atom<"update-filter" | "update-cursor" | null>(null, "updateRatingVariables")

export const updateRatingAction = reatomAsync(async (ctx, type: "update-filter" | "update-cursor") => {
  const filtering = ctx.get(ratingFilterAtom)
  if (!filtering) return;

  updateRatingActionVariablesAtom(ctx, type)

  const cursor = type === 'update-filter' ? undefined : filtering.cursor

  return getRatings({ ...filtering, cursor })
}, {
  name: "updateRatingAction",
  onReject: (ctx, e) => {
    if (e instanceof Error) {
      toast.error(e.message)
    }
  },
  onFulfill: (ctx, res) => {
    if (!res) return;

    const variables = ctx.get(updateRatingActionVariablesAtom)
    if (!variables) return

    if (variables === "update-filter") {
      ratingFilterAtom(ctx, (state) => ({ ...state, cursor: undefined }))
      ratingDataAtom(ctx, res.data)
      ratingMetaAtom(ctx, res.meta)
      return;
    }

    ratingDataAtom(ctx, (state) => {
      if (!state) return res.data;

      if (!state.length) return res.data;

      if ("total" in state[0]) {
        const target = res.data as RatingPlaytime[]
        const prev = state as RatingPlaytime[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )
        
        return [...prev, ...newRating]
      }

      if ("player" in state[0]) {
        const target = res.data as RatingParkour[]
        const prev = state as RatingParkour[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.player === m.player)
        )

        return [...prev, ...newRating]
      }

      if ("balance" in state[0]) {
        const target = res.data as RatingCharism[]
        const prev = state as RatingCharism[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )

        return [...prev, ...newRating]
      }

      if ("points" in state[0]) {
        const target = res.data as RatingBelkoin[]
        const prev = state as RatingBelkoin[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )

        return [...prev, ...newRating]
      }

      if ("reputation" in state[0]) {
        const target = res.data as RatingReputation[]
        const prev = state as RatingReputation[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.nickname === m.nickname)
        )
        
        return [...prev, ...newRating]
      }

      if ("land" in state[0]) {
        const target = res.data as RatingLands[]
        const prev = state as RatingLands[]
        const newRating = target.filter(
          m => !prev.some(exist => exist.land === m.land)
        )

        return [...prev, ...newRating]
      }

      return state;
    })

    ratingMetaAtom(ctx, res.meta)
  }
}).pipe(withStatusesAtom())