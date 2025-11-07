import { Typography } from "@repo/ui/typography"
import { Tasks, TasksFilter } from "@/shared/components/app/tasks/components/tasks"

export default function Page() {
  return (
    <div className="flex lg:flex-row flex-col w-full gap-2">
      <div className="flex flex-col gap-4 w-full p-4">
        <Typography color="white" className="text-2xl font-semibold">
          Задания
        </Typography>
        <div className="flex flex-col gap-4 w-full h-full">
          <TasksFilter />
          <Tasks />
        </div>
      </div>
    </div>
  )
}