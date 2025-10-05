import { Typography } from "@repo/ui/typography"
import { tv } from "tailwind-variants"
import { reatomComponent } from "@reatom/npm-react"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import { createEventAction, eventDescriptionAtom, eventInitiatorAtom, eventTitleAtom, eventTypeAtom } from "../models/actions.model"

const inputVariant = tv({
  base: `p-2 text-lg rounded-lg`
})

const CreateEvent = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Input
        value={ctx.spy(eventTypeAtom)}
        onChange={e => eventTypeAtom(ctx, e.target.value)}
        placeholder="Тип"
        className={inputVariant()}
      />
      <Input
        value={ctx.spy(eventTitleAtom)}
        onChange={e => eventTitleAtom(ctx, e.target.value)}
        placeholder="Заголовок"
        className={inputVariant()}
      />
      <Input
        value={ctx.spy(eventDescriptionAtom)}
        onChange={e => eventDescriptionAtom(ctx, e.target.value)}
        placeholder="Описание"
        className={inputVariant()}
      />
      <Input
        value={ctx.spy(eventInitiatorAtom)}
        onChange={e => eventInitiatorAtom(ctx, e.target.value)}
        placeholder="Инициатор"
        className={inputVariant()}
      />
      <Button
        onClick={() => createEventAction(ctx)}
        disabled={ctx.spy(createEventAction.statusesAtom).isPending}
        className="self-end px-4 rounded-lg font-semibold text-lg bg-neutral-50 text-neutral-950"
      >
        Создать
      </Button>
    </div>
  )
}, "CreateEvent")

export const Actions = () => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Typography className="text-lg">
        Создать ивенты
      </Typography>
      <CreateEvent />
    </div>
  )
}