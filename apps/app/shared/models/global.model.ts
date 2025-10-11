import { atom, Ctx } from "@reatom/core"
import { PageContext } from "vike/types"
import { snapshotAtom, withSsr } from "../lib/ssr"
import { AppOptionsPayload } from "@repo/shared/types/entities/other";
import { client } from "../lib/client-wrapper";
import { localeDefault } from "../locales";

export const pageContextAtom = atom<PageContext | null>(null, "pageContext");

export const isClientAtom = atom<boolean>((ctx) => {
  const pageContext = ctx.spy(pageContextAtom);
  return pageContext ? !!pageContext.Page : false
}, "isClient")

export const isAuthAtom = atom<boolean>(false, "isAuth").pipe(withSsr("isAuth"))

export function initClientGlobalModels(ctx: Ctx, pageContext: PageContext) {
  pageContextAtom(ctx, pageContext);
}

// sync snapshot
pageContextAtom.onChange((ctx, state) => {
  if (state) {
    snapshotAtom(ctx, state.snapshot)
    localeAtom(ctx, state.locale)
  }
})

export const appOptionsInit = {
  bannerIsExists: false
}

export async function getAppOptions(init: RequestInit) {
  return client<AppOptionsPayload>("app/options", init).exec()
}

export const appOptionsAtom = atom<AppOptionsPayload>(appOptionsInit, "appOptions").pipe(withSsr("appOptions"))

export const localeAtom = atom(localeDefault, "locale").pipe(withSsr("locale"))

localeAtom.onChange((ctx, state) => console.log("localeAtom", state))