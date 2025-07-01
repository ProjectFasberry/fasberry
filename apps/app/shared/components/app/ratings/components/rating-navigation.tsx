import { reatomComponent } from "@reatom/npm-react"
import { GetRatings } from "../models/ratings.model"
import { ratingFilterAtom, RatingFilterQuery } from "../models/rating-filter.model"
import { updateRatingAction } from "../models/update-ratings.model"
import { HTMLAttributes } from "react";
import { Typography } from "@repo/ui/typography";

interface NavigationBadgeProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

export const NavigationBadge = ({
  title, ...props
}: NavigationBadgeProps) => {
  return (
    <div
      className="flex items-center duration-150 select-none ease-in data-[state=active]:bg-green-800/80
       rounded-lg px-4 w-full group cursor-pointer justify-center py-4"
      {...props}
    >
      <Typography
        title={title}
        className="text-neutral-50 text-nowrap font-semibold text-lg"
      >
        {title}
      </Typography>
    </div>
  );
};

const RATING_NAVIGATION: { title: string, by: GetRatings["by"] }[] = [
  { title: "Время игры", by: "playtime" },
  { title: "Харизма", by: "charism" },
  { title: "Белкоин", by: "belkoin" },
  { title: "Паркур", by: "parkour" },
  { title: "Регионы", by: "lands_chunks" },
  { title: "Репутация", by: "reputation" }
]

export const RatingNavigation = reatomComponent(({ ctx }) => {
  const currentType = ctx.spy(ratingFilterAtom).by

  const changeRatingType = (by: RatingFilterQuery["by"]) => {
    if (by === currentType) return

    ratingFilterAtom(ctx, (state) => ({ ...state, by }))

    updateRatingAction(ctx, "update-filter")
  }

  return (
    <div className="flex overflow-x-auto overflow-y-hidden gap-2 w-full pb-2">
      {RATING_NAVIGATION.map(rating => (
        <NavigationBadge
          key={rating.by}
          data-state={currentType === rating.by ? "active" : "inactive"}
          title={rating.title}
          onClick={() => changeRatingType(rating.by)}
        />
      ))}
    </div>
  )
}, "RatingNavigation")