import { reatomAsync, withErrorAtom, withStatusesAtom } from "@reatom/async"
import { atom, Ctx } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { withHistory } from "@/lib/reatom-helpers";
import { MINECRAFT_LANDS_API } from "@repo/shared/constants/api";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type AnotherLandsByOwner = UnwrapPromise<ReturnType<typeof getAnotherLandsByOwner>> | null
type Land = UnwrapPromise<ReturnType<typeof getLandById>> | null

export const landParamAtom = atom<string | null>(null, "landParam").pipe(withHistory(1))
export const landAtom = atom<Land>(null, "land").pipe(withReset())
export const landOwnerAtom = atom<string | null>(null, "landOwner").pipe(withReset())
export const anotherLandsByOwnerAtom = atom<AnotherLandsByOwner>(null, "anotherLandsByOwner").pipe(withReset())

function landReset(ctx: Ctx) {
  landAtom.reset(ctx)
  landOwnerAtom.reset(ctx)
  anotherLandsByOwnerAtom.reset(ctx)
}

landParamAtom.onChange((ctx, state) => {
  const prev = ctx.get(landParamAtom.history)[1]

  if (prev !== undefined && prev !== state) {
    landReset(ctx)
  }
})

landAtom.onChange((ctx, state) => {
  if (state) {
    landOwnerAtom(ctx, state.members[0].nickname)
    anotherLandsByOwnerAction(ctx)
  }

  console.log("landAtom", state)
})

landParamAtom.onChange((ctx, state) => {
  if (state) landAction(ctx, state)
})

export type Ex = { 
  ulid: string, 
  created_at: Date | string, 
  stats: any, 
  type: string, 
  chunks_amount: number,
  areas_amount: number, 
  name: string, 
  balance: number,
  level: number,
  title: string, 
  members: Array<{ nickname: string, uuid: string }>
}

async function getLandById(id: string) {
  const res = await MINECRAFT_LANDS_API(`get-land/${id}`)
  const data = await res.json<Ex>()

  if (!data || 'error' in data) return null

  return data
}

export const landAction = reatomAsync(async (ctx, target: string) => {
  if (ctx.get(landAtom)) return ctx.get(landAtom)
    
  return await ctx.schedule(() => getLandById(target))
}, {
  name: "landAction",
  onFulfill: (ctx, res) => landAtom(ctx, res)
}).pipe(withStatusesAtom(), withErrorAtom())

async function getAnotherLandsByOwner(nickname: string, exclude: string) {
  const res = await MINECRAFT_LANDS_API(`player/get-player-lands/${nickname}`, {
    searchParams: {
      exclude
    }
  })

  const data = await res.json<{ data: Array<Ex>, meta: { hasNextPage: boolean, endCursor?: string } }>()

  if (!data || 'error' in data) return null

  return data.data.length > 0 ? data.data : null
}

export const anotherLandsByOwnerAction = reatomAsync(async (ctx) => {
  const nickname = ctx.get(landOwnerAtom)
  const exclude = ctx.get(landParamAtom)

  if (!nickname || !exclude) return; 

  await sleep(1200)

  return await ctx.schedule(() => getAnotherLandsByOwner(nickname, exclude))
}, {
  name: "anotherLandsByOwnerAction",
  onFulfill: (ctx, res) => {
    if (res) anotherLandsByOwnerAtom(ctx, res)
  }
}).pipe(withStatusesAtom())