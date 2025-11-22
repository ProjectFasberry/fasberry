import { client } from "@/shared/lib/client-wrapper"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { userParamAtom } from "./player.model"
import { isEmptyArray } from "@/shared/lib/array"
import { IconBrandDiscord, IconBrandTelegram } from "@tabler/icons-react"
import { ReactNode } from "react"
import { toast } from "sonner"

export type PlayerSocialsValuePayload = {
  id: string | number,
  username: string
}

export type PlayerSocialsPayload = {
  type: "telegram" | "discord",
  value: PlayerSocialsValuePayload
}

export async function getPlayerSocials(nickname: string, init?: RequestInit) {
  return client<PlayerSocialsPayload[]>(`server/socials/list/${nickname}`, { ...init }).exec()
}

export const playerSocialsAction = reatomAsync(async (ctx) => {
  const nickname = ctx.get(userParamAtom)
  if (!nickname) return;

  return await ctx.schedule(() => getPlayerSocials(nickname, { signal: ctx.controller.signal }));
}).pipe(
  withDataAtom([], (_, data) => isEmptyArray(data) ? null : data),
  withStatusesAtom(),
  withCache({ swr: false })
)

export const SOCIAL_ICONS: Record<PlayerSocialsPayload["type"], () => ReactNode> = {
  telegram: () => <IconBrandTelegram size={20} className="text-blue-500" />,
  discord: () => <IconBrandDiscord size={20} className="text-discord-color" />,
}

type SocialEventMap = {
  link: (value: PlayerSocialsValuePayload) => string
  fn: (value: PlayerSocialsValuePayload) => void
};

type SocialEvent = {
  [K in keyof SocialEventMap]: { type: K; cb: SocialEventMap[K] }
}[keyof SocialEventMap];

export const SOCIAL_EVENTS: Record<PlayerSocialsPayload["type"], SocialEvent> = {
  telegram: {
    type: "link",
    cb: (value) => "https://t.me/" + value.username
  },
  discord: {
    type: "fn",
    cb: (value) => {
      navigator.clipboard.writeText(value.username)
      toast.info("Скопировано в буфер обмена")
    }
  }
}