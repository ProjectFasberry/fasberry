import dayjs from "@/shared/lib/create-dayjs"
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { eventsAction } from "../models/events.model";
import { Skeleton } from "@repo/ui/skeleton";
import { AtomState, onConnect } from "@reatom/framework";
import { NotFound } from "@/shared/ui/not-found";
import { isClientAtom } from "@/shared/models/page-context.model";
import { scrollableVariant } from "@/shared/consts/style-variants";

const EventsSkeleton = () => {
  return (
    <>
      <Skeleton className="sm:w-64 h-48" />
      <Skeleton className="sm:w-64 h-48" />
    </>
  )
}

onConnect(eventsAction, eventsAction)

type EventCardProps = NonNullable<AtomState<typeof eventsAction.dataAtom>>[number]

const EventCard = ({ content, id, title }: EventCardProps) => {
  const created_at = dayjs(content.created_at).fromNow();
  
  return (
    <div
      id={id}
      className="flex flex-col justify-between border border-neutral-800 rounded-xl p-2 sm:p-4 h-48 sm:w-64 w-full"
    >
      <div className="flex items-center justify-start bg-neutral-50 rounded-lg p-2 w-full truncate">
        <Typography className="text-neutral-950 text-base font-bold truncate">
          {title}
        </Typography>
      </div>
      <div className="flex flex-col justify-between h-full mt-2">
        {content.description && (
          <Typography className="text-base line-clamp-3">
            {content.description}
          </Typography>
        )}
        <div className="flex flex-col justify-center items-end w-full">
          <Typography color="gray" className="text-sm">
            {created_at}
          </Typography>
        </div>
      </div>
    </div>
  )
}

const EventsList = reatomComponent(({ ctx }) => {
  if (!ctx.spy(isClientAtom)) {
    return <EventsSkeleton />
  }

  const data = ctx.spy(eventsAction.dataAtom)

  if (ctx.spy(eventsAction.statusesAtom).isPending) {
    return <EventsSkeleton />
  }

  if (!data) return <NotFound title="Ивентов нет" />

  return data.map(event => <EventCard key={event.id} {...event}/>)
}, "EventsList")

export const Events = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-bold">
        Последние события
      </Typography>
      <div className={scrollableVariant({ className: "flex overflow-x-auto gap-4 pb-2" })}>
        <EventsList />
      </div>
    </div>
  )
}