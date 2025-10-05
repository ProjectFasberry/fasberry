import { atom } from "@reatom/core"
import { PageContext } from "vike/types"
import { snapshotAtom, withSsr } from "../lib/ssr"

export const pageContextAtom = atom<PageContext | null>(null, "pageContext");

export const isClientAtom = atom<boolean>(false, "isClient").pipe(withSsr("isClient"))

// sync snapshot
pageContextAtom.onChange((ctx, state) => {
  if (state) {
    snapshotAtom(ctx, state.snapshot)
  }
})