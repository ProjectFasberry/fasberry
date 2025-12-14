import { reatomComponent } from "@reatom/npm-react";
import { Switch } from "@repo/ui/switch";
import { Typography } from "@repo/ui/typography";
import { playerSeemsLikePlayersIsShowAtom, toggleShowAction } from "../../player/models/player-seems-like.model";

const SeemsLikeVisibility = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <Typography className="text-xl font-semibold">
        Показывать похожих игроков
      </Typography>
      <Switch
        checked={ctx.spy(playerSeemsLikePlayersIsShowAtom)}
        onCheckedChange={value => toggleShowAction(ctx, value)}
      />
    </div>
  )
}, "SeemsLikeVisibility")

export const SettingsAppWidgets = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <SeemsLikeVisibility />
    </div>
  )
}