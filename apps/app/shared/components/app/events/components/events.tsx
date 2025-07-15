import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { EVENTS, eventsAction } from "../models/events.model";
import { Skeleton } from "@repo/ui/skeleton";
import { onConnect } from "@reatom/framework";

const EVENTS_TITLE_MAP: Record<(typeof EVENTS)[number]["type"], string> = {
  "register": "Регистрация",
  "update-news": "Новость"
}

const EventsSkeleton = () => {
  return (
    <>
      <Skeleton className="h-[80px] w-full" />
      <Skeleton className="h-[80px] w-full" />
    </>
  )
}

onConnect(eventsAction.dataAtom, eventsAction)

const List = reatomComponent(({ ctx }) => {
  const data = ctx.spy(eventsAction.dataAtom)
  
  if (ctx.spy(eventsAction.statusesAtom).isPending) {
    return <EventsSkeleton /> 
  }

  if (!data) return (
    <Typography color='gray'>
      Пусто
    </Typography>
  )

  return (
    data.map((event, idx) => (
      <div key={idx} className="flex flex-col gap-1 bg-neutral-800 rounded-md px-2 py-2 h-[80px] w-auto">
        <div className="bg-neutral-50 flex justify-start items-center w-fit rounded-sm px-2 py-0.5">
          <Typography color="black" className="text-base font-semibold">
            {EVENTS_TITLE_MAP[event.type]}
          </Typography>
        </div>
        <Typography className="text-lg truncate">
          {event.log}
        </Typography>
      </div>
    ))
  )
}, "EventsList")

export const Events = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-semibold">
        Последние события
      </Typography>
      <div className="flex overflox-x-auto gap-2 pb-2 overflow-y-hidden w-full">
        <List />
      </div>
    </div>
  )
}