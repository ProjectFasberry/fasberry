import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import {
  actionsTypeAtom,
  createEventAction,
  createEventDescriptionAtom,
  createEventInitiatorAtom,
  createEventTitleAtom,
  createEventTypeAtom,
  eventsListAction,
} from "../models/actions.model"
import { getSelectedParentAtom, ToActionButtonX } from "./actions.news"
import { AtomState } from "@reatom/core"
import { ReactNode } from "react"
import { Typography } from "@repo/ui/typography"
import { DeleteButton } from "./ui"

const CreateEventTitle = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(createEventTitleAtom)}
      onChange={e => createEventTitleAtom(ctx, e.target.value)}
      placeholder="Заголовок"
    />
  )
}, "CreateEventTitle")

const CreateEventType = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(createEventTypeAtom)}
      onChange={e => createEventTypeAtom(ctx, e.target.value)}
      placeholder="Тип"
    />
  )
}, "CreateEventType")

const CreateEventDesc = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(createEventDescriptionAtom)}
      onChange={e => createEventDescriptionAtom(ctx, e.target.value)}
      placeholder="Описание"
    />
  )
}, "CreateEventDesc")

const CreateEventInitiator = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(createEventInitiatorAtom)}
      onChange={e => createEventInitiatorAtom(ctx, e.target.value)}
      placeholder="Инициатор"
    />
  )
}, "CreateEventInitiator")

const CreateEventSubmit = reatomComponent(({ ctx }) => {
  return (
    <Button
      onClick={() => createEventAction(ctx)}
      disabled={ctx.spy(createEventAction.statusesAtom).isPending}
      className="px-4 bg-neutral-50"
    >
      <Typography className="font-semibold text-lg text-neutral-950">
        Создать
      </Typography>
    </Button>
  )
}, "CreateEventSubmit")

export const CreateEventForm = () => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <CreateEventType />
      <CreateEventTitle />
      <CreateEventDesc />
      <CreateEventInitiator />
      <div className="w-fit">
        <CreateEventSubmit />
      </div>
    </div>
  )
}

const EventsList = reatomComponent(({ ctx }) => {
  useUpdate(eventsListAction, [])

  const data = ctx.spy(eventsListAction.dataAtom)

  if (ctx.spy(eventsListAction.statusesAtom).isPending) {
    return null;
  }

  if (!data) return null;

  return (
    <div className="flex flex-col w-full gap-2 h-full">
      {data.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between gap-1 rounded-lg border border-neutral-800 w-full p-2"
        >
          <div className="flex items-center gap-2">
            <Typography className="text-neutral-400">
              [{event.title}]
            </Typography>
            <Typography className="truncate">
              {event.content.description}
            </Typography>
          </div>
          <div className="flex items-center gap-1">
            <DeleteButton />
          </div>
        </div>
      ))}
    </div>
  )
}, "EventsList")

const EVENTS_VARIANTS: Record<AtomState<typeof actionsTypeAtom>, ReactNode> = {
  "create": <CreateEventForm />,
  "edit": null,
  "view": <EventsList />
}

export const EventsWrapper = reatomComponent(({ ctx }) => {
  if (!ctx.spy(getSelectedParentAtom("event"))) {
    return EVENTS_VARIANTS["view"]
  }

  return EVENTS_VARIANTS[ctx.spy(actionsTypeAtom)]
}, "EventsWrapper")

export const CreateEvent = () => <ToActionButtonX title="Создать" parent="event" type="create" />
export const EditEvent = () => <ToActionButtonX parent="event" type="edit" />