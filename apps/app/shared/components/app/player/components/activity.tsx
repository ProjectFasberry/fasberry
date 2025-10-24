import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { playerActivityAction, playerLocationAction } from "../models/activity.model";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";
import { isClientAtom } from "@/shared/models/page-context.model";

const PlayerLocation = reatomComponent(({ ctx }) => {
  const data = ctx.spy(playerLocationAction.dataAtom);
  if (!data) return null;

  return (
    <div className="flex flex-col items-center overflow-x-auto gap-2 w-full">
      <div className="flex items-center min-w-0 truncate gap-2 w-full">
        <Typography>
          Мир: {data.world}
        </Typography>
        <Typography>
          x: {data.x} y:{data.y} z:{data.z} pitch: {data.pitch} yaw: {data.yaw}
        </Typography>
      </div>
      <Typography className="min-w-0 truncate">
        {data.customLocation}
      </Typography>
    </div>
  )
}, "PlayerLocation")

export const PlayerActivity = reatomComponent(({ ctx }) => {
  useUpdate(playerActivityAction, []);

  if (!ctx.spy(isClientAtom)) {
    return (
      <div className="flex w-full bg-neutral-900 rounded-lg p-4">
        <Skeleton className="h-10 w-24" />
      </div>
    )
  }

  const data = ctx.spy(playerActivityAction.dataAtom)?.result;

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
    <div className="flex flex-col gap-2 w-full bg-neutral-900 rounded-lg p-4">
      <Typography className="font-semibold text-lg">
        {isOnline ? "Онлайн" : "Оффлайн"}
      </Typography>
      {isOnline && <PlayerLocation />}
    </div>
  )
}, "PlayerActivity")