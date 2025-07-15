import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { client } from "@/shared/api/client";
import { toast } from "sonner";
import { currentUserAtom } from "@/shared/models/current-user.model";
import { withHistory } from "@/shared/lib/reatom-helpers";
import type { Land } from "@repo/shared/types/entities/land"

export const landAtom = atom<Land | null>(null, "land").pipe(withReset());

export const landParamAtom = atom<string>((ctx) => {
  const state = ctx.spy(landAtom)
  if (!state) return ""
  return state.ulid
}, "landParamAtom").pipe(withHistory())

export const landOwnerAtom = atom<string>((ctx) => {
  const state = ctx.spy(landAtom)
  if (!state) return "";
  return state.members[0].nickname
}, "landOwner").pipe(withReset())

export const landIsMemberAtom = atom<boolean>((ctx) => {
  const state = ctx.spy(landAtom)
  const currentUser = ctx.get(currentUserAtom)
  if (!currentUser || !state) return false;

  return state.members.some(exist => exist.nickname === currentUser.nickname)
}, "landIsMemberAtom").pipe(withReset())

export const landIsOwnerAtom = atom((ctx) => {
  const currentUser = ctx.get(currentUserAtom)
  if (!currentUser) return false;

  const state = ctx.spy(landAtom)
  if (!state) return false;

  const owner = state.members[0].nickname

  return currentUser.nickname === owner
}, "landIsOwnerAtom").pipe(withReset())

export const landBannerAtom = atom((ctx) => {
  const state = ctx.spy(landAtom)
  if (!state) return "";
  return state.details.banner ?? ""
}, "landBanner").pipe(withReset())

export const landGalleryAtom = atom<string[]>((ctx) => {
  const state = ctx.spy(landAtom)
  if (!state) return [];
  return state.details.gallery ?? []
}, "landGalleryAtom").pipe(withReset())

type AnotherLands = {
  data: Pick<Land, "ulid" | "name" | "members">[],
  meta: PaginatedMeta
}

export const anotherLandsByOwnerAction = reatomAsync(async (ctx, nickname: string) => {
  const exclude = ctx.get(landParamAtom)

  return await ctx.schedule(async () => {
    const res = await client(`server/lands/${nickname}`, {
      searchParams: { exclude }, throwHttpErrors: false, signal: ctx.controller.signal
    })

    const data = await res.json<WrappedResponse<AnotherLands>>()

    if (!data || 'error' in data) return null

    return data.data
  })
}, {
  name: "anotherLandsByOwnerAction",
  onReject: (_, e) => {
    if (e instanceof Error) toast(e.message)
  }
}).pipe(withStatusesAtom(), withDataAtom())