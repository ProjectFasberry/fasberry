import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { getRatings, ratingDataAtom, ratingMetaAtom } from "./ratings.model"
import { ratingFilterAtom } from "./rating-filter.model"

const updateRatingActionVariablesAtom = atom<"update-filter" | "update-cursor" | null>(null, "updateRatingVariables")

export const updateRatingAction = reatomAsync(async (ctx, type: "update-filter" | "update-cursor") => {
  const filtering = ctx.get(ratingFilterAtom)

  if (!filtering) return;
  updateRatingActionVariablesAtom(ctx, type)
  return await getRatings({ ...filtering, cursor: type === 'update-filter' ? undefined : filtering.cursor })
}, {
  name: "updateRatingAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const variables = ctx.get(updateRatingActionVariablesAtom)
    if (!variables) return

    if (variables === "update-filter") {
      ratingFilterAtom(ctx, (state) => ({ ...state, cursor: undefined }))
      ratingDataAtom(ctx, res.data)
      ratingMetaAtom(ctx, res.meta)
      return
    }

    ratingDataAtom(ctx, (state) => {
      if (!state) return res.data;

      const d = state[0]

      let newRating: Array<any> = [];

      if ("TotalPlayTime" in d) {
        newRating = res.data.filter(
          // @ts-ignore
          friend => !prev.data.some(exist => exist.username === friend.username)
        )
      }

      if ("player" in d) {
        newRating = res.data.filter(
          // @ts-ignore
          friend => !prev.data.some(exist => exist.player === friend.player)
        )
      }

      if ("Balance" in d) {
        newRating = res.data.filter(
          // @ts-ignore
          friend => !prev.data.some(exist => exist.username === friend.username)
        )
      }

      if ("points" in d) {
        newRating = res.data.filter(
          // @ts-ignore
          friend => !prev.data.some(exist => exist.username === friend.username)
        )
      }

      if ("reputation" in d) {
        newRating = res.data.filter(
          // @ts-ignore
          friend => !prev.data.some(exist => exist.nickname === friend.nickname)
        )
      }

      return [...res.data, ...newRating]
    })

    ratingMetaAtom(ctx, res.meta)
  }
}).pipe(withStatusesAtom())