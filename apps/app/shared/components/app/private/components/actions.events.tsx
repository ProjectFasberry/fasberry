import { reatomComponent } from "@reatom/npm-react"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import {
  createEventAction,
  createEventDescriptionAtom,
  createEventInitiatorAtom,
  createEventTitleAtom,
  createEventTypeAtom,
} from "../models/actions.model"

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

export const CreateEventForm = () => {
  return (
    <>
      <CreateEventType />
      <CreateEventTitle />
      <CreateEventDesc />
      <CreateEventInitiator />
    </>
  )
}

export const CreateEventSubmit = reatomComponent(({ ctx }) => {
  return (
    <Button
      onClick={() => createEventAction(ctx)}
      disabled={ctx.spy(createEventAction.statusesAtom).isPending}
      className="self-end px-4 rounded-lg font-semibold text-lg bg-neutral-50 text-neutral-950"
    >
      Создать
    </Button>
  )
}, "CreateEventSubmit")