import { atom, Ctx } from "@reatom/core"
import { PageContext } from "vike/types"
import { snapshotAtom, withSsr } from "../lib/ssr"
import { client } from "../api/client";
import { AppOptionsPayload } from "@repo/shared/types/entities/other";

export const pageContextAtom = atom<PageContext | null>(null, "pageContext");

export const isClientAtom = atom<boolean>((ctx) => {
  const pageContext = ctx.spy(pageContextAtom);
  if (!pageContext) return true;

  const isSsr = !!pageContext.Page

  return isSsr
}, "isClient")

export const isAuthAtom = atom<boolean>(false, "isAuth").pipe(withSsr("isAuth"))

export function initClientGlobalModels(ctx: Ctx, pageContext: PageContext) {
  pageContextAtom(ctx, pageContext);
}

// sync snapshot
pageContextAtom.onChange((ctx, state) => {
  if (state) {
    snapshotAtom(ctx, state.snapshot)
  }
})

const appOptionsInit = {
  bannerIsExists: false
}

export async function getAppOptions(init: RequestInit) {
  const res = await client("app/options", { ...init });
  const data = await res.json<WrappedResponse<AppOptionsPayload>>();
  if ("error" in data) throw new Error(data.error)
  return data.data
}

export const appOptionsAtom = atom<AppOptionsPayload>(appOptionsInit, "appOptions").pipe(withSsr("appOptions"))