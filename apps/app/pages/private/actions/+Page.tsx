import { CreateEvent, EditEvent, EventsWrapper } from "@/shared/components/app/private/components/actions.events"
import { BannersWrapper, CreateBanner, EditBanner } from "@/shared/components/app/private/components/actions.banner"
import { CreateNews, EditNews, NewsWrapper } from "@/shared/components/app/private/components/actions.news"
import { Typography } from "@repo/ui/typography"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { pageContextAtom } from "@/shared/models/page-context.model"
import { ActionParent, actionsSearchParamsAtom, actionsTypeAtom, ActionType } from "@/shared/components/app/private/models/actions.model"
import { action } from "@reatom/core"
import { startPageEvents } from "@/shared/lib/events"
import { ReactNode } from "react"

const list: Record<string, Partial<Record<ActionType, ReactNode>>> = {
  "news": {
    "create": <CreateNews />,
    "edit": <EditNews />,
  },
  "event": {
    "create": <CreateEvent />,
    "edit": <EditEvent />
  },
  "banner": {
    "create": <CreateBanner />,
    "edit": <EditBanner />,
  }
}

const ActionsHeaderSlot = reatomComponent<{ parent: ActionParent }>(({ ctx, parent }) => {
  const type = ctx.spy(actionsTypeAtom);
  return list[parent][type] ?? list[parent]["create"]
}, "ActionsHeaderSlot")

const ActionsHeader = (
  { title, parent }: { title: string, parent: ActionParent }
) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 h-8">
        <Typography className="text-xl font-semibold">
          {title}
        </Typography>
      </div>
      <ActionsHeaderSlot parent={parent} />
    </div>
  )
}

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  actionsSearchParamsAtom(ctx, pageContext.urlParsed.search)
})

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [pageContextAtom])

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-col gap-4 w-full h-full bg-neutral-900 rounded-xl p-4">
        <ActionsHeader parent="event" title="Ивенты" />
        <EventsWrapper />
      </div>
      <div className="flex flex-col gap-4 w-full h-full bg-neutral-900 rounded-xl p-4">
        <ActionsHeader parent="banner" title="Баннеры" />
        <BannersWrapper />
      </div>
      <div className="flex flex-col gap-4 w-full h-full bg-neutral-900 rounded-xl p-4">
        <ActionsHeader parent="news" title="Новости" />
        <NewsWrapper />
      </div>
    </div>
  )
}