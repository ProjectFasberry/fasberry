import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom, Ctx } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { BASE } from "@/shared/api/client";
import { withSsr } from "@/shared/api/ssr";

export type Land = {
  title: string,
  name: string,
  created_at: Date | string,
  type: "LAND" | string,
  area: {
    ulid: string,
    banned: string[],
    invites: string[],
    settings: string[],
    holder: any,
    tax: any
  },
  stats: {
    captures: number,
    deaths: number,
    defeats: number,
    kills: number,
    wins: number
  },
  members: Array<{ nickname: string, uuid: string }>
  chunks_amount: number,
  areas_amount: number,
  balance: number,
  level: number,
}

export type Lands = Array<Land>

export const landAtom = atom<Land | null>(null, "land").pipe(
  withReset(), withSsr("land")
)
type d = {
  ulid: string,
  name: string,
  members: { nickname: string, uuid: string }[]
}[]

export const landOwnerAtom = atom<string | null>(null, "landOwner").pipe(withReset())

landAtom.onChange((ctx, state) => {
  console.log("landAtom", state)

  if (state) {
    const target = state.members[0].nickname

    landOwnerAtom(ctx, target)
  }
})

export const anotherLandsByOwnerAction = reatomAsync(async (ctx) => {
  await sleep(400)

  const nickname = ctx.get(landOwnerAtom)
  const exclude = ctx.get(landAtom)?.area.ulid;

  if (!nickname || !exclude) return;

  return await ctx.schedule(async () => {
    const res = await BASE(`server/lands/${nickname}`, {
      searchParams: { exclude },
      signal: ctx.controller.signal
    })

    const data = await res.json<{ data: d, meta: PaginatedMeta }>()

    if (!data || 'error' in data) return null

    return data.data.length > 0 ? data.data : null
  })
}, {
  name: "anotherLandsByOwnerAction",
}).pipe(withStatusesAtom(), withDataAtom())

function landReset(ctx: Ctx) {
  landAtom.reset(ctx)
  landOwnerAtom.reset(ctx)
  anotherLandsByOwnerAction.dataAtom.reset(ctx)
}