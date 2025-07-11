import { reatomComponent } from "@reatom/npm-react";
import { targetUserAtom } from "../models/player.model";
import { Typography } from "@repo/ui/typography";

export const PlayerAttributes = reatomComponent(({ ctx }) => {
  const user = ctx.spy(targetUserAtom)
  if (!user) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="font-semibold text-neutral-50 text-2xl">Привилегия</h2>
      <Typography color="gray" className="text-lg">
        {user.group === 'default' ? "нет" : "да"}
      </Typography>
    </div>
  )
}, "PlayerAttributes")