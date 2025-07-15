import { client } from "@/shared/api/client"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { NewsType } from "../components/news"
import { toast } from "sonner"

export const newsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("shared/news", { throwHttpErrors: false, signal: ctx.controller.signal })
    const data = await res.json<{ data: NewsType[], meta: PaginatedMeta } | { error: string }>()

    if ("error" in data) return null;

    return data.data;
  })
}, {
  name: "newsAction",
  onReject: (_, e) => e instanceof Error && toast(e.message)
}).pipe(withDataAtom(), withStatusesAtom(), withCache())