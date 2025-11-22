import { reatomComponent } from "@reatom/npm-react";
import { Rate } from "./rate";
import { playerAtom } from "../models/player.model";
import dayjs from "@/shared/lib/create-dayjs"
import { DONATE_COLORS, DONATE_TITLE } from "@repo/shared/constants/donate-aliases";
import { Player } from "@repo/shared/types/entities/user";
import { atom } from "@reatom/core";

const PlayerTag = ({ group }: { group: Player["group"] }) => {
  return (
    <div style={{ borderColor: DONATE_COLORS[group] }} className="flex px-3 items-center justify-center gap-2 py-0.5 rounded-full border ">
      <span style={{ backgroundColor: DONATE_COLORS[group] }} className="h-[12px] w-[12px] rounded-full" />
      <span>
        {DONATE_TITLE[group]}
      </span>
    </div>
  )
}

const playerTagsAtom = atom<Player["group"][]>((ctx) => {
  const player = ctx.spy(playerAtom)
  if (!player) return [];

  if (player.group !== 'default') {
    return [player.group, "default"] as Player["group"][]
  }

  return [player.group] as Player["group"][]
}, "playerTags")

export const PlayerInfo = reatomComponent(({ ctx }) => {
  const player = ctx.spy(playerAtom)
  if (!player) return null;

  const loginAt = (player.meta.login_date as string).includes("1970")
    ? "был на сервере давно"
    : dayjs(player.meta.login_date).format("был на сервере D MMM YYYY")

  const tags = ctx.spy(playerTagsAtom)

  return (
    <div className="flex justify-between h-full items-center w-full">
      <div className='flex flex-col gap-2'>
        <h1 className="text-4xl font-bold">{player.nickname}</h1>
        <span>
          {loginAt}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <PlayerTag key={tag} group={tag} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center w-min">
        <Rate isRated={player.rate.isRated} nickname={player.nickname} count={player.rate.count} />
      </div>
    </div>
  )
}, "PlayerInfo")