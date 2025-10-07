import { client } from "@/shared/api/client";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { userParamAtom } from "./player.model";
import { take } from "@reatom/framework";
import { PlayerActivityPayload } from "@repo/shared/types/entities/user";

export const playerActivityAction = reatomAsync(async (ctx) => {
  let nickname = ctx.get(userParamAtom)

  if (!nickname) {
    nickname = await take(ctx, userParamAtom)
  }

  if (!nickname) return null;

  return await ctx.schedule(async () => {
    const res = await client(`server/activity/now/${nickname}`)
    const data = await res.json<WrappedResponse<PlayerActivityPayload>>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, {
  name: "playerActivityAction",
  onFulfill: (ctx, result) => {
    if (!result) return;

    if (result.type === 'online') {
      playerActivityAction(ctx)
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
  return await ctx.schedule(async () => {
    const res = await client(`server/location/${nickname}`)
    const data = await res.json<WrappedResponse<PlayerLocation>>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}).pipe(withDataAtom(null), withStatusesAtom())