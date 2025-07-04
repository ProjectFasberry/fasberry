import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { newsAction } from "../models/news.model"
import { Link } from "@/shared/components/config/Link"

export type News = {
  id: string,
  title: string
  created_at: string,
  description: string,
  imageUrl: string,
  views: number
}

export const News = reatomComponent(({ ctx }) => {
  const data = ctx.spy(newsAction.dataAtom)

  const List = () => {
    if (!data) return null;

    return (
      data.map(news => (
        <div key={news.id} className="flex flex-col h-full w-full rounded-md overflow-hidden">
          <img src={news.imageUrl} alt="" width={1920} height={1080} className="object-cover max-h-[120px] sm:max-h-[200px]" />
          <div className="flex flex-col justify-between bg-neutral-800 px-2 md:px-4 py-2 w-full">
            <Typography className="text-nowrap truncate">
              {news.title}
            </Typography>
            <Link href={`/news/${news.id}`}>
              <Typography color="gray">
                подробнее
              </Typography>
            </Link>
          </div>
        </div>
      ))
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-semibold">
        Актуальные новости проекта
      </Typography>
      <div className="grid grid-cols-2 lg:grid-cols-3 flex-col w-full h-full gap-4">
        {ctx.spy(newsAction.statusesAtom).isPending ? (
          <>
            <Skeleton className="w-full h-[120px] sm:h-[200px]" />
            <Skeleton className="w-full h-[120px] sm:h-[200px]" />
            <Skeleton className="w-full h-[120px] sm:h-[200px]" />
          </>
        ) : <List />}
      </div>
    </div>
  )
}, "News")