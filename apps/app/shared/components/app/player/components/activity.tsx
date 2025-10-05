import { reatomComponent } from "@reatom/npm-react";
import { playerActivityAction, playerLocationAction } from "../models/activity.model";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";

const PlayerLocation = reatomComponent(({ ctx }) => {
  const data = ctx.spy(playerLocationAction.dataAtom);
  if (!data) return null;

  return (
    <div className="flex flex-col w-full">
      {data.world}
    </div>
  )
}, "PlayerLocation")

export const PlayerActivity = reatomComponent(({ ctx }) => {
  const data = ctx.spy(playerActivityAction.dataAtom);

  if (ctx.spy(playerActivityAction.statusesAtom).isPending) {
    return (
      <div className="flex w-full bg-neutral-900 rounded-lg p-4">
        <Skeleton className="h-10 w-24" />
      </div>
    )
  }

  if (!data) return null;

  const isOnline = data.type === 'online'

  return (
    <div className="flex w-full bg-neutral-900 rounded-lg p-4">
      <Typography className="font-semibold text-lg">
        {isOnline ? "Онлайн" : "Оффлайн"}
      </Typography>
      {isOnline && <PlayerLocation />}
    </div>
  )
}, "PlayerActivity")