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
       rounded-xl group cursor-pointer justify-center py-4"
      {...props}
    >
      <Typography
        title={title}
        className="duration-150 group-hover:duration-150 text-shark-50 font-semibold text-[18px]"
      >
        {title}
      </Typography>
    </div>
  );
};


const RATING_NAVIGATION: { title: string, type: GetRatings["type"] }[] = [
  { title: "Время игры", type: "playtime" },
  { title: "Харизма", type: "charism" },
  { title: "Белкоин", type: "belkoin" },
  { title: "Паркур", type: "parkour" },
  { title: "Регионы", type: "lands_chunks" },
  { title: "Репутация", type: "reputation" }
]

export const RatingNavigation = reatomComponent(({ ctx }) => {
  const currentType = ctx.spy(ratingFilterAtom).type

  const changeRatingType = (type: RatingFilterQuery["type"]) => {
    if (type === currentType) return

    ratingFilterAtom(ctx, (state) => ({ ...state, type }))

    updateRatingAction(ctx, "update-filter")
  }

  return (
    <div className="grid grid-cols-2 bg-shark-950 p-2 gap-2 overflow-hidden rounded-xl auto-rows-auto lg:flex lg:flex-nowrap w-full *:w-full">
      {RATING_NAVIGATION.map(rating => (
        <NavigationBadge
          key={rating.type}
          data-state={currentType === rating.type ? "active" : "inactive"}
          title={rating.title}
          onClick={() => changeRatingType(rating.type)}
        />
      ))}
    </div>
  )
}, "RatingNavigation")