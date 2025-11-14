import { client } from "@/shared/api/client"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"

type ServerStatus = {
  proxy: {
    online: number,
    players: Array<string>,
    status: string,
    max: number
  },
  servers: {
    bisquite: {
      online: number
    }
  }
}

export const serverStatusAction = reatomAsync(async (ctx) => {
  return ctx.schedule(async () => {
    const res = await client("server/status", { searchParams: { type: "servers" }, signal: ctx.controller.signal })
    const data = await res.json<{ data: ServerStatus } | { error: string }>()
    if (!data || "error" in data) return null;
    return data.data;
  })
}, "serverStatusAction").pipe(withCache({ swr: false }), withDataAtom(), withStatusesAtom())