import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { SeemsLikePlayersPayload } from "@repo/shared/types/entities/other";
import { userParamAtom } from "./player.model";
import { take } from "@reatom/framework";
import { client } from "@/shared/api/client";

export const playerSeemsLikeAction = reatomAsync(async (ctx) => {
  let nickname = ctx.get(userParamAtom)

  if (!nickname) {
    nickname = await take(ctx, userParamAtom)
  }

  if (!nickname) return null;

  return await ctx.schedule(async () => {
    const res = await client(`server/seems-like/${nickname}`, { searchParams: { limit: 6 } });
    const data = await res.json<WrappedResponse<SeemsLikePlayersPayload>>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, "playerSeemsLikeAction").pipe(withDataAtom(), withStatusesAtom())
