import { client } from "@/shared/lib/client-wrapper"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import dayjs from "@/shared/lib/create-dayjs"
import { Typography } from "@repo/ui/typography"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table"

type d = {
  event: string;
  created_at: Date;
  id: number;
  initiator: string;
}[]

const historyListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<d>("privated/history/list").exec()
  )
}).pipe(withDataAtom(), withStatusesAtom())

const HistoryList = reatomComponent(({ ctx }) => {
  useUpdate(historyListAction, []);

  const data = ctx.spy(historyListAction.dataAtom);

  if (ctx.spy(historyListAction.statusesAtom).isPending) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!data) return null;

  return (
    <Table>
      <TableCaption>История</TableCaption>
      <TableHeader>
        <TableRow className="*:font-semibold *:text-base">
          <TableHead className="w-[64px]">#</TableHead>
          <TableHead>Инициатор</TableHead>
          <TableHead>Ивент</TableHead>
          <TableHead className="text-right">Дата</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, idx) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{idx + 1}</TableCell>
            <TableCell>
              {item.initiator}
            </TableCell>
            <TableCell>
              {item.event}
            </TableCell>
            <TableHead className="text-right">
              {dayjs(item.created_at).format("DD.MM.YYYY hh:mm")}
            </TableHead>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}, "HistoryList")

export default function Page() {
  return (
    <div className="bg-neutral-900 rounded-xl p-4">
      <HistoryList />
    </div>
  )
}