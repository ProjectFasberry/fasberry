import { reatomAsync, withErrorAtom, withStatusesAtom } from "@reatom/async"
import { atom, Ctx } from "@reatom/core"
import { landsClient } from "@repo/shared/api/minecraft-client"
import type { UnwrapPromise } from '@repo/lib/helpers/unwrap-promise-type';
import { playerClient } from "@repo/shared/api/minecraft-client"
import { sleep, withReset } from "@reatom/framework"
import { withHistory } from "@repo/lib/utils/reatom/with-history";
import { logger } from "@repo/lib/utils/logger";

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

  logger.info("landAtom", state)
})

landParamAtom.onChange((ctx, state) => {
  if (state) landAction(ctx, state)
})

async function getLandById(id: string) {
  const res = await landsClient.lands['get-land'][':id'].$get({ param: { id } })
  const data = await res.json()

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
  const res = await playerClient.player['get-player-lands'][':nickname'].$get({
    param: { nickname }, query: { exclude },
  })

  const data = await res.json()

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