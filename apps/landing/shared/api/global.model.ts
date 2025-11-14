import { atom } from "@reatom/core"
import { PageContext } from "vike/types"

export const pageContextAtom = atom<PageContext | null>(null, "pageContext")