import { atom } from "@reatom/core"
import { GetRatings } from "./ratings.model"
import { withHistory } from "@/shared/lib/reatom-helpers"

export const ratingByAtom = atom<GetRatings["by"]>("playtime", "ratingBy").pipe(withHistory(1))
export const ratingFilterAtom = atom<{ ascending: boolean }>({ ascending: false }, "ratingFilter")