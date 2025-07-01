import { RatingList } from "@/shared/components/app/ratings/components/rating-list";
import { RatingNavigation } from "@/shared/components/app/ratings/components/rating-navigation";
import { ratingAction, ratingDataAtom } from "@/shared/components/app/ratings/models/ratings.model";
import { onConnect } from "@reatom/framework";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Typography } from "@repo/ui/typography";
import RatingsPreview from "@repo/assets/images/sand-camel.jpg"

onConnect(ratingDataAtom, ratingAction)

const RatingsPreviewImage = () => {
  return (
    <div className="flex select-none flex-col items-center justify-end relative overflow-hidden h-[180px] rounded-lg w-full">
      <img
        draggable={false}
        src={RatingsPreview}
        alt=""
        loading="lazy"
        width={800}
        height={800}
        className="absolute w-full h-[210px] rounded-lg object-cover"
      />
      <div className="absolute bottom-0 bg-gradient-to-t h-[60px] from-black/60 via-black/20 to-transparent w-full" />
    </div>
  )
}

export default function RatingsPage() {
  return (
    <MainWrapperPage>
      <div className="flex flex-col gap-4 w-full h-full">
        <RatingsPreviewImage />
        <div className="flex flex-col gap-4 h-full w-full">
          <Typography color="white" className="font-semibold text-2xl">
            Рейтинг сервера
          </Typography>
          <RatingNavigation />
          <RatingList />
        </div>
      </div>
    </MainWrapperPage>
  )
}