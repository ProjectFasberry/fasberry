import { client } from "@/shared/api/client"
import { logError } from "@/shared/lib/log"
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom, batch, Ctx } from "@reatom/core"
import { withReset } from "@reatom/framework"
import { BannerPayload, BannersPayload } from "@repo/shared/types/entities/banner"
import { toast } from "sonner"
import { newsAction } from "../../news/models/news.model"
import { News } from "@repo/shared/types/entities/news"
import { EventPayload } from "@repo/shared/types/entities/other"

export const eventTitleAtom = atom("", "eventTitle").pipe(withReset())
export const eventDescriptionAtom = atom("", "eventDescription").pipe(withReset())
export const eventInitiatorAtom = atom("", "eventInitiator").pipe(withReset())
export const eventTypeAtom = atom("", "eventType").pipe(withReset())

function resetEventFields(ctx: Ctx) {
  batch(ctx, () => {
    eventTitleAtom.reset(ctx)
    eventDescriptionAtom.reset(ctx)
    eventInitiatorAtom.reset(ctx)
    eventTypeAtom.reset(ctx)
  })
}

export const createEventAction = reatomAsync(async (ctx) => {
  const json = {
    title: ctx.get(eventTitleAtom),
    description: ctx.get(eventDescriptionAtom),
    initiator: ctx.get(eventInitiatorAtom),
    type: ctx.get(eventTypeAtom)
  }

  return await ctx.schedule(async () => {
    const res = await client.post("server/events/create", { json })
    const data = await res.json<WrappedResponse<EventPayload>>()
    if ("error" in data) throw new Error(data.error)
    return data.data;
  })
}, {
  name: "createEventAction",
  onFulfill: (ctx, res) => {
    toast.success("Ивент создан");
    resetEventFields(ctx)
  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  },
}).pipe(withStatusesAtom())

export const newsTitleAtom = atom("").pipe(withReset());
export const newsDescriptionAtom = atom("").pipe(withReset());
export const newsImageAtom = atom("").pipe(withReset());

function resetNewsFields(ctx: Ctx) {
  newsTitleAtom.reset(ctx)
  newsDescriptionAtom.reset(ctx)
  newsImageAtom.reset(ctx)
}

export const createNewsAction = reatomAsync(async (ctx) => {
  const json = {
    title: ctx.get(newsTitleAtom),
    description: ctx.get(newsDescriptionAtom),
    imageUrl: ctx.get(newsImageAtom)
  }

  return await ctx.schedule(async () => {
    const res = await client.post("shared/news/create", { json })
    const data = await res.json<WrappedResponse<News>>()
    if ("error" in data) throw new Error(data.error)
    return data.data;
  })
}, {
  name: "createNewsAction",
  onFulfill: (ctx, res) => {
    toast.success("Новость создана")

    newsAction.dataAtom(ctx, (state) => {
      if (!state) return null;
      const newData = [...state.data, res]
      return { data: newData, meta: state.meta }
    })

    resetNewsFields(ctx)
  },
  onReject: (ctx, e) => {
    logError(e)
  }
})

export const deleteNewsAction = reatomAsync(async (ctx, id: number) => {
  return await ctx.schedule(async () => {
    const res = await client.delete(`shared/news/${id}`);
    const data = await res.json<WrappedResponse<{ id: number }>>()
    if ('error' in data) throw new Error(data.error)
    return data.data
  })
}, {
  name: "deleteNewsAction",
  onFulfill: (ctx, res) => {
    toast.success("Новость удалена")

    newsAction.dataAtom(ctx, (state) => {
      if (!state) return null;

      const newData = state.data.filter(news => news.id !== res.id)

      return { data: newData, meta: state.meta }
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())

export const deleteBannerAction = reatomAsync(async (ctx, id: number) => {
  return await ctx.schedule(async () => {
    const res = await client.delete(`shared/banner/${id}`);
    const data = await res.json<WrappedResponse<{ id: number }>>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, {
  name: "deleteBannerAction",
  onFulfill: (ctx, res) => {
    toast.success("Баннер удален");

    bannersAction.dataAtom(ctx, (state) => {
      if (!state) return null;
      const newData = state.data.filter(banner => banner.id !== res.id)
      return { data: newData, meta: state.meta }
    })
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())

export const bannersAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client(`shared/banner/list`);
    const data = await res.json<WrappedResponse<BannersPayload>>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}).pipe(withDataAtom(null), withStatusesAtom())

export const bannerTitleAtom = atom("").pipe(withReset())
export const bannerDescriptionAtom = atom("").pipe(withReset())
export const bannerHrefTitleAtom = atom("").pipe(withReset())
export const bannerHrefValueAtom = atom("").pipe(withReset())

export function resetBannerFields(ctx: Ctx) {
  bannerTitleAtom.reset(ctx)
  bannerDescriptionAtom.reset(ctx)
  bannerHrefTitleAtom.reset(ctx)
  bannerHrefValueAtom.reset(ctx)
}

export const createBannerAction = reatomAsync(async (ctx) => {
  const json = {
    title: ctx.get(bannerTitleAtom),
    description: ctx.get(bannerDescriptionAtom),
    href: {
      title: ctx.get(bannerHrefTitleAtom),
      value: ctx.get(bannerHrefValueAtom)
    }
  }

  return await ctx.schedule(async () => {
    const res = await client.post("shared/banner/create", { json });
    const data = await res.json<WrappedResponse<BannerPayload>>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, {
  name: 'createBannerAction',
  onFulfill: (ctx, res) => {
    toast.success("Баннер создан");

    bannersAction.dataAtom(ctx, (state) => {
      if (!state) return null;
      const newData = [...state.data, res]
      return { data: newData, meta: state.meta }
    })

    resetBannerFields(ctx)
  },
  onReject: (ctx, e) => {
    logError(e)
  }
})