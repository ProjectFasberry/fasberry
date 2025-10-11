import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { SeemsLikePlayersPayload } from "@repo/shared/types/entities/other";
import { userParamAtom } from "./player.model";
import { action, atom, take } from "@reatom/framework";
import { withSsr } from "@/shared/lib/ssr";
import { toast } from "sonner";
import { setCookie } from "@/shared/lib/cookie";
import dayjs from "@/shared/lib/create-dayjs";
import { client, withQueryParams } from "@/shared/lib/client-wrapper";

export const playerSeemsLikePlayersIsShowKey = "playerSeemsLikeShow"

export const playerSeemsLikePlayersIsShowAtom = atom(true, 'playerSeemsLikePlayersIsShow').pipe(withSsr(playerSeemsLikePlayersIsShowKey))

export const toggleShowAction = action((ctx) => {
  const value = !ctx.get(playerSeemsLikePlayersIsShowAtom);

  setCookie(playerSeemsLikePlayersIsShowKey, String(value), {
    maxAgeMs: dayjs().add(1, "month").diff(dayjs()), path: "/"
  })

  playerSeemsLikePlayersIsShowAtom(ctx, value);

  if (!value) {
    toast.success(`Блок скрыт на 30 дней`)
  }
}, "toggleShowAction")

userParamAtom.onChange((ctx, state) => {
  if (!state) return;

  const history = ctx.get(userParamAtom.history)

  if (history.length > 1) {
    playerSeemsLikeAction.dataAtom.reset(ctx)
    playerSeemsLikeAction(ctx)
  }
})

export const playerSeemsLikeAction = reatomAsync(async (ctx) => {
  let nickname = ctx.get(userParamAtom)

  if (!nickname) {
    nickname = await take(ctx, userParamAtom)
  }

  if (!nickname) return null;

  return await ctx.schedule(() =>
    client<SeemsLikePlayersPayload>(`server/seems-like/${nickname}`)
      .pipe(withQueryParams({ limit: 6 }))
      .exec()
  )
}, "playerSeemsLikeAction").pipe(withDataAtom(), withStatusesAtom())