import { DEFAULT_SOFT_TIMEOUT } from "@/shared/consts/delays";
import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";
import { reatomAsync, withDataAtom, withErrorAtom, withStatusesAtom } from "@reatom/async";
import { action, atom, sleep, withConcurrency } from "@reatom/framework";
import { TasksPayload } from "@repo/shared/types/entities/other";

export const tasksAscendingAtom = atom(false, "tasksAscending")
export const tasksCursorAtom = atom<Maybe<string>>(undefined, "tasksCursor")
export const tasksSearchQueryAtom = atom<string>("", "tasksSearchQuery")

export const onChange = action(async (ctx, e) => {
  const { value } = e.target;
  tasksSearchQueryAtom(ctx, value)

  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT))

  tasksAction(ctx)
}, "onChange").pipe(withConcurrency())

tasksAscendingAtom.onChange((ctx) => tasksAction(ctx))

export const tasksAction = reatomAsync(async (ctx) => {
  const params = {
    asc: ctx.get(tasksAscendingAtom),
    endCursor: ctx.get(tasksCursorAtom),
    searchQuery: ctx.get(tasksSearchQueryAtom)
  }

  return await ctx.schedule(() =>
    client<TasksPayload>("server/task/list")
      .pipe(withAbort(ctx.controller.signal), withQueryParams(params))
      .exec()
  )
}, "tasksAction").pipe(
  withDataAtom(null, (_, data) => data.data.length === 0 ? null : data), 
  withStatusesAtom(), 
  withErrorAtom()
)