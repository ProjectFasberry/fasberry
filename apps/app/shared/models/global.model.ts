import { atom } from "@reatom/core"
import { PageContext } from "vike/types"

export const pageContextAtom = atom<PageContext | null>(null, "pageContext")

export const isClientAtom = atom((ctx) => {
  const pageContext = ctx.spy(pageContextAtom)
  return pageContext ? !pageContext.isClientSide : false
}, "isSsr")