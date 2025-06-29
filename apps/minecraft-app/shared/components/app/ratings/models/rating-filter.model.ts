import { atom } from "@reatom/core"
import { GetRatings } from "./ratings.model"

export type RatingFilterQuery = Omit<GetRatings, "limit">

export const ratingFilterAtom = atom<RatingFilterQuery>({ type: "playtime", ascending: false }, "ratingFilter")