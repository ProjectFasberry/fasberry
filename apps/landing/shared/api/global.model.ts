import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { PageContext } from "vike/types"
import { withSsr } from "./ssr"

export const pageContextAtom = atom<PageContext | null>(null, "pageContext")

export const loggedUserAtom = atom<string | undefined>(undefined, "loggedUser").pipe(
  withReset(), withSsr("loggedUser")
)