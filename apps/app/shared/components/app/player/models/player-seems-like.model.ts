import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { SeemsLikePlayersPayload } from "@repo/shared/types/entities/other";
import { playerParamAtom } from "./player.model";
import { action, atom, Ctx, take } from "@reatom/framework";
import { withSsr } from "@/shared/lib/ssr";
import { toast } from "sonner";
import { setCookie } from "@/shared/lib/cookie";
import dayjs from "@/shared/lib/create-dayjs";
import { client } from "@/shared/lib/client-wrapper";

export const playerSeemsLikePlayersIsShowKey = "playerSeemsLikeShow"

export const playerSeemsLikePlayersIsShowAtom = atom(true, 'playerSeemsLikePlayersIsShow').pipe(
  withSsr(playerSeemsLikePlayersIsShowKey)
)

export const toggleShowAction = action((ctx, inputValue?: boolean) => {
  const isInputed = typeof inputValue !== 'undefined'

  const value = isInputed ? inputValue : !ctx.get(playerSeemsLikePlayersIsShowAtom);

  setCookie(playerSeemsLikePlayersIsShowKey, String(value), {
    maxAgeMs: dayjs().add(1, "month").diff(dayjs()), path: "/"
  })

  playerSeemsLikePlayersIsShowAtom(ctx, value);

  if (!isInputed) {
    if (!value) {
      toast.success(`Блок скрыт на 30 дней`)
    }
  }
}, "toggleShowAction")

playerParamAtom.onChange((ctx, state) => {
  if (!state) return;
  
  playerSeemsLikeAction.dataAtom.reset(ctx)
  playerSeemsLikeAction(ctx)
})

export const playerSeemsLikeAction = reatomAsync(async (ctx) => {
  let nickname = ctx.get(playerParamAtom)

  if (!nickname) {
    nickname = await take(ctx, playerParamAtom)
  }

  if (!nickname) return null;

  const result = await ctx.schedule(
    () => client<SeemsLikePlayersPayload>(`server/seems-like/${nickname}`, {
      signal: ctx.controller.signal,
      searchParams: { limit: 8 }
    })
    .exec()
  )

  return result
}, "playerSeemsLikeAction").pipe(
  withDataAtom(null), 
  withStatusesAtom()
)