import { atom, Ctx } from "@reatom/core"
import { PageContext } from "vike/types"
import { snapshotAtom } from "../lib/ssr"
import { localeDefault } from "../locales";
import { appOptionsAtom } from "./app.model";
import { setupUrlAtomSettings, urlAtom } from "@reatom/url";

export const pageContextAtom = atom<PageContext | null>(null, "pageContext");

export const isClientAtom = atom<boolean>((ctx) => {
  const pageContext = ctx.spy(pageContextAtom);
  return pageContext ? !!pageContext.Page : false
}, "isClient")

export const isAuthAtom = atom<boolean>((ctx) => ctx.spy(appOptionsAtom)?.isAuth ?? false, "isAuth")

export const localeAtom = atom((ctx) => ctx.spy(appOptionsAtom).locale ?? localeDefault, "locale")

urlAtom.onChange((ctx, state) => console.log("urlAtom", state))

export function initClientGlobalModels(ctx: Ctx, pageContext: PageContext) {
  pageContextAtom(ctx, pageContext);

  if (typeof window === 'undefined') {
    const url = new URL(pageContext.urlParsed.href)
    setupUrlAtomSettings(ctx, () => url)
  }
}

// sync snapshot
pageContextAtom.onChange((ctx, state) => {
  if (state) {
    snapshotAtom(ctx, state.snapshot);
  }
})
