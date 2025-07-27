import { atom } from "@reatom/core"
import { PageContext } from "vike/types"

export const pageContextAtom = atom<PageContext | null>(null, "pageContext")

export const isSsrAtom = atom((ctx) => {
  const pageContext = ctx.spy(pageContextAtom)

  const isSsr = pageContext ? !!pageContext.Page : false

  return !isSsr
}, "isSsr")