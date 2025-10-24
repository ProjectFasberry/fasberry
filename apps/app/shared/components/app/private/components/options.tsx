import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Skeleton } from "@repo/ui/skeleton";
import { Switch } from "@repo/ui/switch";
import { Typography } from "@repo/ui/typography";
import { optionsAction, optionsAtom, updateOptionAction } from "../models/options.model";
import { AtomState } from "@reatom/core";

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

type OptionItemProps = AtomState<typeof optionsAtom> extends Map<any, infer V> ? V : never;

const OptionItem = reatomComponent<OptionItemProps>(({ ctx, name, title, value }) => {
  return (
    <div className="flex border border-neutral-800 p-2 rounded-lg items-center justify-between w-full gap-1">
      <Typography className="text-lg font-semibold">
        {title}
      </Typography>
      <Switch
        checked={value}
        onCheckedChange={v => updateOptionAction(ctx, name, v)}
      />
    </div>
  )
}, "OptionItem")

const OptionsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(optionsAtom).values()

  if (ctx.spy(optionsAction.statusesAtom).isPending) {
    return <OptionsListSkeleton />
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {data.map((option) => <OptionItem key={option.name} {...option} />)}
    </div>
  )
}, "OptionsList")

export const Options = () => {
  useUpdate(optionsAction, []);
  
  return (
    <OptionsList />
  )
}