import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { userParamAtom } from "./player.model";
import { take } from "@reatom/framework";
import { PlayerActivityPayload } from "@repo/shared/types/entities/user";
import { client } from "@/shared/lib/client-wrapper";

export const playerActivityAction = reatomAsync(async (ctx) => {
  let nickname = ctx.get(userParamAtom)

  if (!nickname) {
    nickname = await take(ctx, userParamAtom)
  }

  if (!nickname) return null;

  const result = await ctx.schedule(() => 
    client<PlayerActivityPayload>(`server/activity/now/${nickname}`).exec()
  )

  return { nickname, result }
}, {
  name: "playerActivityAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { result, nickname } = res;
    if (!result) return;

    if (result.type === 'online') {
      playerLocationAction(ctx, nickname)
    }
  },
  onReject: (ctx, e) => {
    logError(e)
  }
}).pipe(withDataAtom(), withStatusesAtom())

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
    client<PlayerLocation>(`server/location/${nickname}`).exec()
  )
}).pipe(withDataAtom(null), withStatusesAtom(), withCache({ swr: false }))