import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withDataAtom, withRetry, withStatusesAtom } from "@reatom/async";
import { PlayerActivityPayload } from "@repo/shared/types/entities/user";
import { client } from "@/shared/lib/client-wrapper";
import { playerParamAtom } from "./player.model";

export const playerActivityAction = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(() =>
    client<PlayerActivityPayload>(`server/activity/now/${nickname}`, { 
      signal: ctx.controller.signal, retry: 1 
    }).exec()
  )
}, {
  name: "playerActivityAction",
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(
  withDataAtom(null), 
  withStatusesAtom(), 
  withRetry()
)

playerParamAtom.onChange((ctx, state) => {
  if (!state) return;
  playerActivityAction(ctx, state)
})

type PlayerLocation = {
  world: string,
  x: number,
  y: number,
  z: number,
  pitch: number,
  yaw: number,
  customLocation: string | null
}

export const playerLocationAction = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(() =>
    client<PlayerLocation>(`server/location/${nickname}`, { retry: 1 }).exec()
  )
}).pipe(
  withDataAtom(null),
  withStatusesAtom(),
  withCache({ swr: false })
)