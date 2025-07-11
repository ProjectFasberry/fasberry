import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { PageContext } from "vike/types"
import { BASE } from "./client"
import { withSsr } from "./ssr"

export const pageContextAtom = atom<PageContext | null>(null, "pageContext")
export const pageSearchParams = atom<Record<string, string>>({}, "pageSearchParams")
export const isSsrAtom = atom(true, "isSsr")

pageContextAtom.onChange((ctx, target) => {
  if (target) {
    pageSearchParams(ctx, target.urlParsed.search)
    isSsrAtom(ctx, false)
  }
})

export async function getMe(args?: RequestInit) {
  const res = await BASE("get-me", { throwHttpErrors: false, ...args })
  if (!res.ok) return null;

  const data = await res.json<WrappedResponse<CurrentUser>>()

  if ('error' in data) return null;

  return data.data;
}

export const currentUserAtom = atom<CurrentUser | null>(null, "currentUser").pipe(
  withReset(), withSsr("currentUser")
)