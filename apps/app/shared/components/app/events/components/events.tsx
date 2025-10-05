import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { eventsAction } from "../models/events.model";
import { Skeleton } from "@repo/ui/skeleton";
import { AtomState, onConnect } from "@reatom/framework";
import { NotFound } from "@/shared/ui/not-found";
import { isEmptyArray } from "@/shared/lib/array";
import dayjs from "@/shared/lib/create-dayjs"

const EventsSkeleton = () => {
  return (
    <>
      <Skeleton className="sm:w-64 h-48 flex-shrink-0" />
      <Skeleton className="sm:w-64 h-48 flex-shrink-0" />
    </>
  )
}

onConnect(eventsAction.dataAtom, eventsAction)

const EventCard = ({ 
  content, id, type, title 
}: NonNullable<AtomState<typeof eventsAction.dataAtom>>[number]) => {
  return (
    <div
      id={id}
      className="flex flex-col justify-between bg-neutral-800 rounded-lg p-4 w-full sm:w-64 h-48 duration-200 flex-shrink-0"
    >
      <div className="bg-neutral-50 rounded-md px-3 py-1 w-full truncate">
        <Typography color="black" className="text-base font-semibold truncate">
          {title}
        </Typography>
      </div>
      <div className="flex flex-col justify-between h-full mt-2">
        {content.description && (
          <Typography color="gray" className="text-sm line-clamp-3">
            {content.description}
          </Typography>
        )}
        <div className="mt-auto flex flex-col gap-0.5">
          <Typography className="text-sm font-medium truncate">
            by {content.initiator}
          </Typography>
          <Typography color="gray" className="text-xs">
            {dayjs(content.created_at).fromNow()}
          </Typography>
        </div>
      </div>
    </div>
  )
}

const EventsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(eventsAction.dataAtom)

  if (ctx.spy(eventsAction.statusesAtom).isPending) {
    return <EventsSkeleton />
  }

  const isEmpty = isEmptyArray(data)

  if (isEmpty) return <NotFound title="Ивентов нет" />

  return (
    data.map((event) => (
      <EventCard
        key={event.id}
        type={event.type}
        title={event.title}
        content={event.content}
        id={event.id}
      />
    ))
  )
}, "EventsList")

export const Events = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-bold">
        Последние события
      </Typography>
      <div className="flex overflow-x-auto gap-4 pb-2">
        <EventsList />
      </div>
    </div>
  )
}