import { client } from "@/shared/api/client";
import { reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { sleep } from "@reatom/framework";
import { Land } from "@repo/shared/types/entities/land";
import { toast } from "sonner";

export const landsResource = reatomResource(async (ctx) => {
  await sleep(200);

  return await ctx.schedule(async () => {
    const res = await client("server/lands", { signal: ctx.controller.signal, throwHttpErrors: false })
    const data = await res.json<{ data: Array<Land>, meta: PaginatedMeta } | { error: string }>()

    if ('error' in data) return null

    return data
  })
}, "landsResource").pipe(withDataAtom(), withCache(), withStatusesAtom())

landsResource.onReject.onCall((_, e) => {
  if (e instanceof Error) toast(e.message)
})