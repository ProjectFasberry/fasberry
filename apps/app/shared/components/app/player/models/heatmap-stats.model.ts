import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { toast } from "sonner";

export const value = [
  { date: '2025/01/11', count: 0 },
  { date: '2025/01/12', count: 0 },
  { date: '2025/01/13', count: 0 },
  ...[...Array(17)].map((_, idx) => ({
    date: `2025/02/${idx + 10}`, count: 0, content: ''
  })),
  { date: '2025/04/11', count: 0 },
  { date: '2025/05/01', count: 0 },
  { date: '2025/05/02', count: 0 },
  { date: '2025/05/04', count: 0 },
];

export const playerActivity = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    return value
  })
}, {
  name: "playerActivity",
  onReject: (ctx, e) => {
    if (e instanceof Error) toast.error(e.message)
  }
}).pipe(withStatusesAtom(), withDataAtom())