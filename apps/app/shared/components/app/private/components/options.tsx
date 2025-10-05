import { reatomComponent } from "@reatom/npm-react";
import { Skeleton } from "@repo/ui/skeleton";
import { Switch } from "@repo/ui/switch";
import { Typography } from "@repo/ui/typography";
import { optionsAction, optionsAtom, updateOptionAction } from "../models/options.model";

const OptionsListSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex items-center justify-between w-full gap-1">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex items-center justify-between w-full gap-1">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

const OptionsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(optionsAtom).values()

  if (ctx.spy(optionsAction.statusesAtom).isPending) {
    return <OptionsListSkeleton />
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {data.map((option) => (
        <div key={option.name} className="flex items-center justify-between w-full gap-1">
          <Typography className="text-lg">
            Регистрация
          </Typography>
          <Switch
            checked={option.value}
            onCheckedChange={v => updateOptionAction(ctx, option.name, v)}
          />
        </div>
      ))}
    </div>
  )
}, "OptionsList")

export const Options = () => {
  return (
    <OptionsList />
  )
}