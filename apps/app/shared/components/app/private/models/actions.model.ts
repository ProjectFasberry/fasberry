import z from "zod"
import { logError } from "@/shared/lib/log"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { action, atom, AtomState, Ctx } from "@reatom/core"
import { reatomRecord, withReset } from "@reatom/framework"
import { BannerPayload, BannersPayload } from "@repo/shared/types/entities/banner"
import { toast } from "sonner"
import { getNews } from "../../news/models/news.model"
import { News } from "@repo/shared/types/entities/news"
import { client, withJsonBody, withLogging } from "@/shared/lib/client-wrapper"
import type { JSONContent } from "@tiptap/react"
import { createNewsSchema } from '@repo/shared/schemas/news';
import { getEvents } from "../../events/models/events.model"
import { EventPayload } from "@repo/shared/types/entities/other"

export const createEventTitleAtom = atom("", "createEventTitle").pipe(withReset())
export const createEventDescriptionAtom = atom("", "createEventDescription").pipe(withReset())
export const createEventInitiatorAtom = atom("", "createEventInitiator").pipe(withReset())
export const createEventTypeAtom = atom("", "createEventType").pipe(withReset())

function resetEventFields(ctx: Ctx) {
  createEventTitleAtom.reset(ctx)
  createEventDescriptionAtom.reset(ctx)
  createEventInitiatorAtom.reset(ctx)
  createEventTypeAtom.reset(ctx)
}

export const eventsListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => getEvents({}, {}))
}).pipe(withDataAtom(null), withCache({ swr: false }), withStatusesAtom())

export const createEventAction = reatomAsync(async (ctx) => {
  const json = {
    title: ctx.get(createEventTitleAtom),
    description: ctx.get(createEventDescriptionAtom),
    initiator: ctx.get(createEventInitiatorAtom),
    type: ctx.get(createEventTypeAtom)
  }

  return await ctx.schedule(() =>
    client
      .post<EventPayload>("privated/events/create", { throwHttpErrors: false })
      .pipe(withJsonBody(json), withLogging())
      .exec()
  )
}, {
  name: "createEventAction",
  onFulfill: (ctx, res) => {
    toast.success("Ивент создан");

    eventsListAction.cacheAtom.reset(ctx)

    eventsListAction.dataAtom(ctx, (state) => {
      if (!state) return null;
      return [...state, res]
    })

    resetEventFields(ctx)
  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  },
}).pipe(withStatusesAtom())

// 
export const createNewsTitleAtom = atom("", "createNewsTitle").pipe(withReset());
export const createNewsDescriptionAtom = atom("", "createNewsDescription").pipe(withReset());
export const createNewsImageAtom = atom("", "createNewsImage").pipe(withReset());
export const createNewsContentAtom = atom<JSONContent | null>(null, "createNewsContent").pipe(withReset());
export const createNewsTempContentAtom = atom<string | null>(null, "createNewsTempContent").pipe(withReset());

export const createNewsContentIsValidAtom = atom((ctx) => {
  const currentStr = ctx.spy(createNewsTempContentAtom)
  return currentStr && currentStr.length >= 1
}, "createNewsContentIsValid")

export const createNewsIsValidAtom = atom((ctx) => {
  const value: Nullable<z.infer<typeof createNewsSchema>> = {
    title: ctx.spy(createNewsTitleAtom),
    description: ctx.spy(createNewsDescriptionAtom),
    imageUrl: ctx.spy(createNewsImageAtom),
    content: ctx.spy(createNewsContentAtom),
  }

  return z.safeParse(createNewsSchema, value).success
}, "createNewsIsValid")

function resetNewsFields(ctx: Ctx) {
  createNewsTitleAtom.reset(ctx)
  createNewsDescriptionAtom.reset(ctx)
  createNewsImageAtom.reset(ctx)
  createNewsContentAtom.reset(ctx)
  createNewsTempContentAtom.reset(ctx)
}

export const newsListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => getNews({}, { asc: false }))
}).pipe(withDataAtom(null), withStatusesAtom(), withCache({ swr: false }))

export function notifyAboutRestrictRole(e: Error | unknown) {
  if (e instanceof Error) {
    if (e.message === 'restricted_by_role') {
      toast.error("Действие недоступно из-за политики ролей")
    }
  }
}

export const createNewsAction = reatomAsync(async (ctx) => {
  const json = {
    title: ctx.get(createNewsTitleAtom),
    description: ctx.get(createNewsDescriptionAtom),
    imageUrl: ctx.get(createNewsImageAtom),
    content: ctx.get(createNewsContentAtom)
  }

  return await ctx.schedule(() =>
    client
      .post<News>("privated/news/create")
      .pipe(withJsonBody(json), withLogging())
      .exec()
  )
}, {
  name: "createNewsAction",
  onFulfill: (ctx, res) => {
    toast.success("Новость создана")

    newsListAction.cacheAtom.reset(ctx)

    newsListAction.dataAtom(ctx, (state) => {
      if (!state) return null;
      const newData = [...state.data, res]
      return { data: newData, meta: state.meta }
    })

    resetNewsFields(ctx)
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

export const deleteNewsAction = reatomAsync(async (ctx, id: number) => {
  return await ctx.schedule(() =>
    client
      .delete<{ id: number }>(`privated/news/${id}`)
      .exec()
  )
}, {
  name: "deleteNewsAction",
  onFulfill: (ctx, res) => {
    toast.success("Новость удалена")

    newsListAction.cacheAtom.reset(ctx)

    newsListAction.dataAtom(ctx, (state) => {
      if (!state) return null;
      const newData = state.data.filter(news => news.id !== res.id)
      return { data: newData, meta: state.meta }
    })
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

export const deleteBannerAction = reatomAsync(async (ctx, id: number) => {
  return await ctx.schedule(() =>
    client
      .delete<{ id: number }>(`privated/banners/${id}`)
      .exec()
  )
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
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

// 
export const bannersAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<BannersPayload>(`shared/banner/list`)
      .exec()
  )
}).pipe(withDataAtom(null), withStatusesAtom(), withCache({ swr: false }))

export const createBannerTitleAtom = atom("", "createBannerTitle").pipe(withReset())
export const createBannerDescriptionAtom = atom("", "createBannerDescription").pipe(withReset())
export const createBannerHrefTitleAtom = atom("", "createBannerHrefTitle").pipe(withReset())
export const createBannerHrefValueAtom = atom("", "createBannerHrefValue").pipe(withReset())

function resetBannerFields(ctx: Ctx) {
  createBannerTitleAtom.reset(ctx)
  createBannerDescriptionAtom.reset(ctx)
  createBannerHrefTitleAtom.reset(ctx)
  createBannerHrefValueAtom.reset(ctx)
}

export const createBannerAction = reatomAsync(async (ctx) => {
  const json = {
    title: ctx.get(createBannerTitleAtom),
    description: ctx.get(createBannerDescriptionAtom),
    href: {
      title: ctx.get(createBannerHrefTitleAtom),
      value: ctx.get(createBannerHrefValueAtom)
    }
  }

  return await ctx.schedule(() =>
    client
      .post<BannerPayload>("privated/banners/create")
      .pipe(withJsonBody(json))
      .exec()
  )
}, {
  name: 'createBannerAction',
  onFulfill: (ctx, res) => {
    toast.success("Баннер создан");

    bannersAction.cacheAtom.reset(ctx)

    bannersAction.dataAtom(ctx, (state) => {
      if (!state) return null;
      const newData = [...state.data, res]
      return { data: newData, meta: state.meta }
    })

    resetBannerFields(ctx)
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

// 
export const actionsSearchParamsAtom = reatomRecord<Record<string, string>>({}, "actionsSearchParams").pipe(withReset())
export const actionsParentAtom = atom<"news" | "banner" | "event" | null>(null, "actionsParent").pipe(withReset())
export const actionsTypeAtom = atom<"create" | "edit" | "view">("view", "actionsType").pipe(withReset())
export const actionsTargetAtom = atom<string | null>(null, "actionsTarget").pipe(withReset())

actionsSearchParamsAtom.onChange((ctx, state) => {
  const { parent, type, target } = state

  if (parent === 'news' || parent === 'banner' || parent === 'event') {
    actionsParentAtom(ctx, parent)
  }

  if (type === 'create' || type === 'edit' || type === 'view') {
    actionsTypeAtom(ctx, type)
  }

  if (type !== 'create') {
    if (typeof target === 'string' && target.trim()) {
      actionsTargetAtom(ctx, target)
    }
  } else {
    actionsTargetAtom(ctx, null)
  }
})

type CreateLinkParams = {
  parent?: AtomState<typeof actionsParentAtom>,
  type?: AtomState<typeof actionsTypeAtom>,
  target?: string,
}

export const createActionsLink = (ctx: Ctx, params: CreateLinkParams) => {
  const url = new URL(window.location.href);
  const next = { ...ctx.get(actionsSearchParamsAtom) }

  if (params.parent === 'news' || params.parent === 'banner' || params.parent === 'event') {
    next.parent = params.parent
    url.searchParams.set('parent', params.parent)
  }

  if (params.type === 'create' || params.type === 'edit' || params.type === 'view') {
    next.type = params.type
    url.searchParams.set('type', params.type)

    if (params.type === 'create') {
      delete next.target
      url.searchParams.delete('target')
    }
  }

  if (params.type !== 'create' && params.target?.trim()) {
    next.target = params.target
    url.searchParams.set('target', params.target)
  }

  actionsSearchParamsAtom(ctx, next)
  window.history.pushState({}, '', url)
}

export const actionsCanGoBackAtom = (inputParent: AtomState<typeof actionsParentAtom>) => atom((ctx) => {
  const state = ctx.spy(actionsSearchParamsAtom);
  const { parent: currentParent, type, target } = state;

  const isThisParent = currentParent === inputParent
  if (!isThisParent) return false;

  const validParent = currentParent === 'news' || currentParent === 'banner' || currentParent === 'event'
  const validType = type === 'create' || type === 'edit' || type === 'view'
  const validTarget = type !== 'create' ? typeof target === 'string' && target.trim() !== '' : true

  const result = validParent && validType && validTarget
  return result
}, 'actionsCanGoBack')

export const actionsGoBackAction = action((ctx) => {
  const url = new URL(window.location.href)

  url.searchParams.delete('parent')
  url.searchParams.delete('type')
  url.searchParams.delete('target')

  window.history.pushState({}, '', url)

  actionsSearchParamsAtom.reset(ctx)
  actionsParentAtom.reset(ctx)
  actionsTypeAtom.reset(ctx)
  actionsTargetAtom.reset(ctx)
}, "actionsGoBackAction")