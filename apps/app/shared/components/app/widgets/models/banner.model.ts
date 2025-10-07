import { client } from "@/shared/api/client";
import { logError } from "@/shared/lib/log";
import { appOptionsAtom } from "@/shared/models/global.model";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { BannerPayload } from "@repo/shared/types/entities/other";

export const bannerIsExistsAtom = atom((ctx) => ctx.spy(appOptionsAtom).bannerIsExists, "bannerIsExists")

bannerIsExistsAtom.onChange((ctx, state) => {
  if (!state) return;

  bannerAction(ctx)
})

export const bannerAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("shared/banner/latest");
    const data = await res.json<WrappedResponse<BannerPayload | null>>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, "bannerAction").pipe(withDataAtom(null), withCache({ swr: false }), withStatusesAtom())

export const viewBannerAction = reatomAsync(async (ctx, id: number) => {
  return await ctx.schedule(async () => {
    const res = await client.post(`shared/banner/view/${id}`)
    const data = await res.json<WrappedResponse<unknown>>()
    if ('error' in data) throw new Error(data.error)
    return data.data
  })
}, {
  name: "viewBannerAction",
  onFulfill: (ctx, res) => {
    appOptionsAtom(ctx, { bannerIsExists: false })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())