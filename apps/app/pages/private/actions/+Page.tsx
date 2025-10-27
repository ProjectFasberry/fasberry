import {
  CreateEventSubmit,
  CreateEventForm,
} from "@/shared/components/app/private/components/actions.events"
import { BannersList, CreateBanner, CreateBannerForm } from "@/shared/components/app/private/components/actions.banner"
import { NewsWrapper } from "@/shared/components/app/private/components/actions.news"
import { Typography } from "@repo/ui/typography"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { pageContextAtom } from "@/shared/models/page-context.model"
import { actionsCanGoBackAtom, actionsGoBackAction, actionsParentAtom, actionsSearchParamsAtom } from "@/shared/components/app/private/models/actions.model"
import { action, AtomState } from "@reatom/core"
import { Button } from "@repo/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { startPageEvents } from "@/shared/lib/events"

const ActionsBack = reatomComponent<{ 
  parent: NonNullable<AtomState<typeof actionsParentAtom>> 
}>(({ ctx, parent }) => {
  const canGoBack = ctx.spy(actionsCanGoBackAtom(parent));
  if (!canGoBack) return null;

  return (
    <Button onClick={() => actionsGoBackAction(ctx)} className="bg-neutral-800 h-8 w-8 aspect-square p-0">
      <IconArrowLeft size={18} />
    </Button>
  )
}, "ActionsBack")

const ActionsHeader = (
  { title, parent }: { title: string, parent: NonNullable<AtomState<typeof actionsParentAtom>> }
) => {
  return (
    <div className="flex items-center gap-2 h-8">
      <ActionsBack parent={parent} />
      <Typography className="text-xl font-semibold">
        {title}
      </Typography>
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
        <div className="flex flex-col gap-2 w-full h-full">
          <CreateEventForm />
          <CreateEventSubmit />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full h-full bg-neutral-900 rounded-xl p-4">
        <ActionsHeader parent="banner" title="Баннеры" />
        <BannersList />
        <div className="flex flex-col gap-2">
          <CreateBannerForm />
          <CreateBanner />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full h-full bg-neutral-900 rounded-xl p-4">
        <ActionsHeader parent="news" title="Новости" />
        <NewsWrapper />
      </div>
    </div>
  )
}