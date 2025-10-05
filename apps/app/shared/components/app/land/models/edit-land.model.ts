import { logError } from "@/shared/lib/log"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom } from "@reatom/core"
import { withAssign, withReset } from "@reatom/framework"
import { toast } from "sonner"

type NewLandChangesKeys = "banner" | "gallery"

export const landChangesAtom = atom<Record<NewLandChangesKeys | string, string[]>>({}, "newLandChanges").pipe(withReset())

export const newBannerUrl = atom("", "newBannerUrl").pipe(withReset())
export const newGalleryUrls = atom<string[]>([], "newGalleryUrls").pipe(withReset())

export const landMode = atom<"watch" | "edit">("watch", "landMode").pipe(
  withAssign((target) => ({
    toggle: action((ctx) => ctx.get(target) === 'watch' ? target(ctx, "edit") : target(ctx, "watch"))
  }))
).pipe(withReset())

landMode.onChange((_, target) =>
  toast.info(`Режим редактирования региона ${target === 'edit' ? "" : "де"}активирован`)
)

landChangesAtom.onChange((ctx, state) => {
  const keys = Object.keys(state)

  if (keys.includes("banner")) {
    newBannerUrl(ctx, state["banner"][0])
  }

  if (keys.includes("gallery")) {
    newGalleryUrls(ctx, state["gallery"])
  }
})

export const changesIsExist = atom((ctx) => {
  const state = ctx.spy(landChangesAtom)
  const keys = Object.keys(state)
  const values = Object.values(state)
  const flatValues = values.flat()

  return keys.length > 0 && flatValues.length > 0
}, "changesIsExist")

export const saveChanges = reatomAsync(async (ctx) => {
  const isChanges = ctx.get(changesIsExist)
  if (!isChanges) return;

  const changes = ctx.get(landChangesAtom)

  toast.warning("Not implemented. Soon...")

  return undefined;

  // return await ctx.schedule(async () => {
  //   
  // })
}, {
  name: "saveChanges",
  onFulfill: (ctx, res) => {
    if (!res) return;

    landMode.reset(ctx)
    newGalleryUrls.reset(ctx)
    landChangesAtom.reset(ctx)
    newBannerUrl.reset(ctx)
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())