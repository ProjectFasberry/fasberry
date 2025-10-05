import { Ratings } from "@/shared/components/app/ratings/components/rating-list";
import { RatingNavigation } from "@/shared/components/app/ratings/components/rating-navigation";
import { ratingsAction } from "@/shared/components/app/ratings/models/ratings.model";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { useUpdate } from "@reatom/npm-react";
import { action } from "@reatom/core";

const ratingsImage = getStaticImage("arts/sand-camel.jpg")

const RatingsPreviewImage = () => {
  return (
    <div className="flex select-none flex-col items-center justify-end relative overflow-hidden h-[180px] rounded-lg w-full">
      <img
        src={ratingsImage}
        draggable={false}
        alt=""
        width={800}
        height={800}
        className="absolute w-full h-[210px] rounded-lg object-cover"
      />
      <div className="absolute bottom-0 bg-gradient-to-t h-[60px] from-black/60 via-black/20 to-transparent w-full" />
    </div>
  )
}

const startEventsAction = action((ctx) => {
  ratingsAction(ctx)
}, "startEventsAction")

export default function RatingsPage() {
  useUpdate(startEventsAction, []);

  return (
    <MainWrapperPage>
      <div className="flex flex-col gap-4 w-full h-full">
        <RatingsPreviewImage />
        <div className="flex flex-col gap-4 h-full w-full">
          <Typography color="white" className="font-semibold text-2xl">
            Рейтинг сервера
          </Typography>
          <RatingNavigation />
          <Ratings />
        </div>
      </div>
    </MainWrapperPage>
  )
}