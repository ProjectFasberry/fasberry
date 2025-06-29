import { RatingList } from "@/shared/components/app/ratings/components/rating-list";
import { RatingNavigation } from "@/shared/components/app/ratings/components/rating-navigation";

export default function RatingsPage() {
  return (
    <div className="flex flex-col w-full gap-4 items-center justify-center h-full relative">
      <RatingNavigation />
      <div className="flex w-full bg-primary-color p-2 rounded-lg h-full">
        <RatingList />
      </div>
    </div>
  )
}