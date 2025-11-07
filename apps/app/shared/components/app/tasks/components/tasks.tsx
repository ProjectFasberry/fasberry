import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { onChange, tasksAction, tasksAscendingAtom, tasksSearchQueryAtom } from "../models/tasks.model"
import { IconArrowDown, IconArrowUp, IconSearch } from "@tabler/icons-react"
import { Button } from "@repo/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu"
import { Typography } from "@repo/ui/typography"
import { Input } from "@repo/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog"
import { Skeleton } from "@repo/ui/skeleton"
import { tv } from "tailwind-variants"
import { ReactNode } from "react"
import { belkoinImage, charismImage } from "@/shared/consts/images"
import { getStaticImage } from "@/shared/lib/volume-helpers"
import { TaskItem as TaskItemProps } from "@repo/shared/types/entities/other"

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

const ACTION: Record<string, (value: string) => ReactNode> = {
  "link": (value: string) => (
    <a href={value} target="_blank" rel="noreferrer">
      <Button className="w-full lg:w-fit h-10 bg-neutral-50">
        <Typography className="text-neutral-950 font-semibold">
          Выполнить
        </Typography>
      </Button>
    </a>
  )
}


const taskItemVariant = tv({
  base: `flex flex-col items-center justify-between gap-4 h-48 w-full rounded-lg p-4 border border-neutral-800`,
  slots: {
    firstGroup: "flex flex-col gap-1 justify-start w-full",
    secondGroup: "flex flex-col lg:flex-row lg:items-center lg:gap-2 gap-2 lg:justify-end w-full"
  }
})

const TaskItemSkeleton = () => {
  return (
    <div className={taskItemVariant().base()}>
      <div className={taskItemVariant().firstGroup()}>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className={taskItemVariant().secondGroup()}>
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}

const TaskItem = (
  { title, description, reward_value, action_type, action_value, reward_currency }: TaskItemProps
) => {
  const action = ACTION[action_type](action_value!)

  return (
    <div className={taskItemVariant().base()}>
      <div className={taskItemVariant().firstGroup()}>
        <Typography className="font-semibold text-lg truncate">
          {title}
        </Typography>
        <Typography color="gray" className="truncate">
          {description}
        </Typography>
      </div>
      <div className={taskItemVariant().secondGroup()}>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full lg:w-fit h-10 bg-neutral-800">
              <Typography className="text-base">
                Награда
              </Typography>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="text-center text-2xl">Ивент: {title}</DialogTitle>
            <div className="flex flex-col gap-4 p-2 items-center justify-center w-full">
              <div className="flex flex-col gap-2 w-full">
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

const TasksFilterSearch = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center w-full lg:w-2/3 h-10 relative">
      <IconSearch size={20} className="text-neutral-400 absolute z-1 left-4" />
      <Input
        className="w-full h-10 pl-12"
        placeholder="Название"
        onChange={e => onChange(ctx, e)}
        value={ctx.spy(tasksSearchQueryAtom)}
        maxLength={1024}
      />
    </div>
  )
}, "TasksFilterSearch")

const TasksFilterType = reatomComponent(({ ctx }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-neutral-800 w-full min-w-0 px-4 py-2 rounded-md">
        <Typography className="font-semibold text-nowrap truncate">
          Сортировать по: <span className="text-neutral-400">Дате создания</span>
        </Typography>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="w-full min-w-56 bg-neutral-800">
        <DropdownMenuItem className="font-semibold w-full">
          Дате создания
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}, "TasksFilterType")

const TasksFilterAsc = reatomComponent(({ ctx }) => {
  const asc = ctx.spy(tasksAscendingAtom);

  const handle = () => tasksAscendingAtom(ctx, (state) => !state)

  return (
    <Button
      className="bg-neutral-800 text-neutral-300 flex aspect-square h-10 w-10 p-0 items-center justify-center"
      onClick={handle}
      disabled={ctx.spy(tasksAction.statusesAtom).isPending}
    >
      {asc ? <IconArrowUp size={20} /> : <IconArrowDown size={20} />}
    </Button>
  )
}, "TasksFilterAsc")

export const TasksFilter = () => {
  return (
    <div className="flex lg:flex-nowrap flex-wrap items-center gap-2 w-full">
      <TasksFilterSearch />
      <div className="flex lg:flex-nowrap flex-wrap items-center gap-2 w-full lg:w-1/3">
        <TasksFilterType />
        <TasksFilterAsc />
      </div>
    </div>
  )
}

const TasksSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 auto-rows-auto gap-4 w-full">
      <TaskItemSkeleton />
      <TaskItemSkeleton />
      <TaskItemSkeleton />
      <TaskItemSkeleton />
    </div>
  )
}

export const Tasks = reatomComponent(({ ctx }) => {
  useUpdate(tasksAction, [])

  const data = ctx.spy(tasksAction.dataAtom)?.data;

  if (ctx.spy(tasksAction.statusesAtom).isPending) {
    return <TasksSkeleton />
  }

  const error = ctx.spy(tasksAction.errorAtom)

  if (error) {
    return <span className="text-red-500">{error.message}</span>
  }

  if (!data) return <EventsNotFound />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 auto-rows-auto gap-4 w-full">
      {data.map((task) => <TaskItem key={task.id} {...task} />)}
    </div>
  )
}, "Tasks")