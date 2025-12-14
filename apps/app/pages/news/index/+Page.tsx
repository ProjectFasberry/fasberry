import { NewsList, NewsViewer } from "@/shared/components/app/news/components/news-list";
import { NewsFilters } from "@/shared/components/app/news/components/news-list.filters";
import { Typography } from "@repo/ui/typography";

export default function Page() {
  return (
    <div className="flex flex-col w-full h-full gap-6">
      <Typography className="text-3xl font-semibold">
        Новости
      </Typography>
      <div className="flex flex-col gap-4 h-full w-full">
        <NewsFilters />
        <div className="flex flex-col w-full h-full">
          <NewsList />
          <NewsViewer />
        </div>
      </div>
    </div>
  )
}