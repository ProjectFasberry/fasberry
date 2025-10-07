import { reatomComponent } from "@reatom/npm-react";
import { playerAtom } from "../models/player.model";
import { Typography } from "@repo/ui/typography";

export const PlayerAttributes = reatomComponent(({ ctx }) => {
  const player = ctx.spy(playerAtom)
  if (!player) return null;

  const resultIsGroup = player.group === 'default' ? "нет" : "да"

  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="font-semibold text-neutral-50 text-2xl">Привилегия</h2>
      <Typography color="gray" className="text-lg">
        {resultIsGroup}
      </Typography>
    </div>
  )
}, "PlayerAttributes")