import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { newsAction } from "../models/news.model"
import { createLink, Link } from "@/shared/components/config/Link"

export type News = {
  id: string,
  title: string
  created_at: string,
  description: string,
  imageUrl: string,
  views: number
}

const List = reatomComponent(({ ctx }) => {
  const data = ctx.spy(newsAction.dataAtom)
  if (!data) return null;

  return (
    data.map(news => (
      <div
        key={news.id}
        className="flex flex-col h-full w-full 
          hover:bg-neutral-800 duration-150 border border-neutral-800 rounded-lg overflow-hidden"
      >
        <img
          draggable={false}
          src={news.imageUrl}
          alt=""
          width={1920}
          loading="lazy"
          height={1080}
          className="object-cover max-h-[100px] sm:max-h-[200px]"
        />
        <div className="flex flex-col justify-between p-2 md:p-4 w-full">
          <Typography className="text-lg font-semibold text-nowrap truncate">
            {news.title}
          </Typography>
          <Link href={createLink("news", news.id)} className="w-fit">
            <Typography className="text-blue-500">
              подробнее
            </Typography>
          </Link>
        </div>
      </div>
    ))
  )
}, "List")

export const News = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-semibold">
        Новости проекта
      </Typography>
      <div className="grid grid-cols-2 lg:grid-cols-3 flex-col w-full h-full gap-4">
        {(ctx.spy(newsAction.statusesAtom).isPending && !ctx.spy(newsAction.cacheAtom)) && (
          <>
            <Skeleton className="w-full h-[100px] sm:h-[200px]" />
            <Skeleton className="w-full h-[100px] sm:h-[200px]" />
            <Skeleton className="w-full h-[100px] sm:h-[200px]" />
          </>
        )}
        <List />
      </div>
    </div>
  )
}, "News")