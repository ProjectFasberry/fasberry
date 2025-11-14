import { reatomComponent } from "@reatom/npm-react"
import { ratingByAtom } from "../models/ratings.model"
import { Typography } from "@repo/ui/typography";
import { action, AtomState } from "@reatom/core";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { scrollableVariant } from "@/shared/consts/style-variants";

const RATING_NAVIGATION: { title: string, by: AtomState<typeof ratingByAtom> }[] = [
  { title: "Время игры", by: "playtime" },
  { title: "Харизма", by: "charism" },
  { title: "Белкоин", by: "belkoin" },
  { title: "Паркур", by: "parkour" },
  { title: "Регионы", by: "lands_chunks" },
  { title: "Репутация", by: "reputation" }
]

const changeBy = action((ctx, target: AtomState<typeof ratingByAtom>) => {
  const currentType = ctx.get(ratingByAtom)
  if (target === currentType) return;

  ratingByAtom(ctx, target)
}, "changeBy")

export const RatingNavigation = reatomComponent(({ ctx }) => {
  const value = ctx.spy(ratingByAtom);

  return (
    <Tabs
      value={value}
      onValueChange={v => changeBy(ctx, v as AtomState<typeof ratingByAtom>)}
      activationMode="manual"
    >
      <TabsList className={scrollableVariant({ className: "flex w-full border border-neutral-800 scrollbar-h-2 overflow-x-auto overflow-y-hidden" })}>
        {RATING_NAVIGATION.map(rating => (
          <TabsTrigger key={rating.by} value={rating.by} className="w-full px-4 h-12">
            <Typography className="text-lg">
              {rating.title}
            </Typography>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs >
  )
}, "RatingNavigation")
