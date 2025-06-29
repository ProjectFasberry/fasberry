import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { PageContext } from "vike/types"
import { BASE } from "./client"
import { withSsr } from "./ssr"
import { withHistory } from "../lib/reatom-helpers"

export const userParam = atom<string>("", "userParam").pipe(withHistory(), withReset())

export const pageContextAtom = atom<PageContext | null>(null, "pageContext")
export const pageSearchParams = atom<Record<string, string>>({}, "pageSearchParams")
export const isSsrAtom = atom(true, "isSsr")

pageContextAtom.onChange((ctx, target) => {
  if (target) {
    pageSearchParams(ctx, target.urlParsed.search)
    isSsrAtom(ctx, false)
  }
})

export async function getMe(headers?: Record<string, string>) {
  const res = await BASE("get-me", { headers: headers, throwHttpErrors: false })

  const data = await res.json<{ data: CurrentUser } | { error: string }>()

  if ('error' in data) return null;

  return data.data;
}

export const currentUserAtom = atom<CurrentUser | null>(null, "currentUser").pipe(
  withReset(), withSsr("currentUser")
)