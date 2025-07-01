import { atom } from "@reatom/core"
import { GetRatings } from "./ratings.model"

export type RatingFilterQuery = Omit<GetRatings, "limit">

export const ratingFilterAtom = atom<RatingFilterQuery>({ by: "playtime", ascending: false }, "ratingFilter")