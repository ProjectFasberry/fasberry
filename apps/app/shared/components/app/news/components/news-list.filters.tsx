import { Button } from "@repo/ui/button"
import { newsAllAction, newsAscAtom, newsSearchQueryAtom, onChange } from "../models/news-list.model"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Input } from "@repo/ui/input"
import { IconArrowDown, IconArrowUp, IconSearch } from "@tabler/icons-react"

const NewsFilterSearch = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center w-full h-10 relative">
      <IconSearch size={20} className="text-neutral-400 absolute z-1 left-4" />
      <Input
        className="w-full h-10 pl-12"
        placeholder="Название"
        onChange={e => onChange(ctx, e)}
        value={ctx.spy(newsSearchQueryAtom)}
        maxLength={1024}
      />
    </div>
  )
}, "TasksFilterSearch")

const NewsFilterAsc = reatomComponent(({ ctx }) => {
  const asc = ctx.spy(newsAscAtom);

  const handle = () => newsAscAtom(ctx, (state) => !state)

  return (
    <Button
      background="default"
      className="text-neutral-50 flex aspect-square h-10 w-10 p-0 items-center justify-center"
      onClick={handle}
      disabled={ctx.spy(newsAllAction.statusesAtom).isPending}
    >
      {asc ? <IconArrowUp size={20} /> : <IconArrowDown size={20} />}
    </Button>
  )
}, "TasksFilterAsc")

export const NewsFilters = () => {
  return (
    <div className="flex justify-between items-center gap-2 w-full">
      <NewsFilterSearch />
      <NewsFilterAsc />
    </div>
  )
}