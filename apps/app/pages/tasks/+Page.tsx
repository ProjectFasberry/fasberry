import { Typography } from "@repo/ui/typography"
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/dialog"
import { Button } from "@repo/ui/button"
import { getStaticImage } from "@/shared/lib/volume-helpers"
import { belkoinImage, charismImage } from "@/shared/components/app/shop/components/cart/cart-price"
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async"
import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { TaskItem as TaskItemProps, TasksPayload } from "@repo/shared/types/entities/other"
import { action, atom } from "@reatom/core"
import { startPageEvents } from "@/shared/lib/events"
import { pageContextAtom } from "@/shared/models/page-context.model"
import { ReactNode } from "react"
import { Skeleton } from "@repo/ui/skeleton"
import { sleep } from "@reatom/framework"
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"

const eventImage = getStaticImage("arts/looking.jpg")

const EventsNotFound = () => {
  return (
    <div className="flex w-full items-center justify-center h-full gap-12 px-12 py-6 relative">
      <div className="flex flex-col items-center gap-y-4">
        <img src={eventImage} alt="" width={256} height={256} />
        <Typography className="text-xl font-bold text-shark-50">
          Ивентов пока нет
        </Typography>
      </div>
    </div>
  )
}

const Currency = ({ type, value }: { type: string, value: number }) => {
  return (
    <div className="flex items-center gap-1">
      <img src={type === 'CHARISM' ? charismImage : belkoinImage} alt="" width={32} height={32} />
      <Typography className="text-base">{value}</Typography>
    </div>
  )
}

const tasksAscendingAtom = atom(false, "tasksAscending")
const tasksCursorAtom = atom<Maybe<string>>(undefined, "tasksCursor")

tasksAscendingAtom.onChange((ctx) => tasksAction(ctx))

const tasksAction = reatomAsync(async (ctx) => {
  const params = {
    asc: ctx.get(tasksAscendingAtom),
    endCursor: ctx.get(tasksCursorAtom)
  }

  await sleep(160);

  return await ctx.schedule(() =>
    client<TasksPayload>("server/task/list")
      .pipe(withAbort(ctx.controller.signal), withQueryParams(params))
      .exec()
  )
}).pipe(withDataAtom(), withStatusesAtom())

const ACTION: Record<string, (value: string) => ReactNode> = {
  "link": (value: string) => (
    <a href={value} target="_blank" rel="noreferrer">
      <Button className="w-full lg:w-fit bg-neutral-50">
        <Typography className="text-lg text-neutral-950 font-semibold">
          Выполнить
        </Typography>
      </Button>
    </a>
  )
}

const TaskItem = (
  { title, description, reward_value, action_type, action_value, reward_currency }: TaskItemProps
) => {
  const action = ACTION[action_type](action_value!)

  return (
    <div className="flex flex-col items-center gap-4 w-full rounded-lg p-4 bg-neutral-900">
      <div className="flex flex-col justify-start w-full">
        <Typography className="font-semibold text-lg">
          {title}
        </Typography>
        <Typography color="gray">
          {description}
        </Typography>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2 gap-2 lg:justify-end w-full">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full lg:w-fit border-2 border-neutral-700">
              <Typography className="text-base">
                Награда
              </Typography>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-y-4 items-center justify-center w-full">
              <Typography className="text-xl font-semibold">
                Ивент: {title}
              </Typography>
              <div className="flex flex-col gap-2 p-2 w-full">
                <Typography className="text-lg font-semibold">
                  Награда:
                </Typography>
                <Currency type={reward_currency} value={reward_value} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {action}
      </div>
    </div>
  )
}

const TasksFilter = reatomComponent(({ ctx }) => {
  const asc = ctx.spy(tasksAscendingAtom);

  const handle = () => {
    tasksAscendingAtom(ctx, (state) => !state)
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div>

      </div>
      <Button
        className="bg-neutral-900 text-neutral-300 flex aspect-square p-2 items-center justify-center"
        onClick={handle}
        disabled={ctx.spy(tasksAction.statusesAtom).isPending}
      >
        {asc ? <IconArrowUp /> : <IconArrowDown />}
      </Button>
    </div>
  )
}, "TasksFilter")

const TasksSkeleton = () => {
  return (
    <>
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </>
  )
}

const Tasks = reatomComponent(({ ctx }) => {
  const data = ctx.spy(tasksAction.dataAtom)?.data;

  if (ctx.spy(tasksAction.statusesAtom).isPending) {
    return <TasksSkeleton />
  }

  if (!data) return <EventsNotFound />

  return (
    data.map((task) => (
      <TaskItem key={task.id} {...task} />
    ))
  )
}, "Tasks")

const events = action((ctx) => {
  tasksAction(ctx)
})

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [pageContextAtom]);

  return (
    <div className="flex lg:flex-row flex-col w-full gap-2">
      <div className="flex flex-col gap-y-4 w-full !p-4">
        <Typography color="white" className="text-2xl font-semibold">
          Задания
        </Typography>
        <div className="flex flex-col gap-2 w-full h-full">
          <TasksFilter />
          <div className="grid lg:grid-cols-3 2xl:grid-cols-4 auto-rows-auto gap-4 w-full">
            <Tasks />
          </div>
        </div>
      </div>
    </div>
  )
}