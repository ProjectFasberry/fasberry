import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { newsAction } from "../models/news.model"
import { createLink, Link } from "@/shared/components/config/link"
import { AtomState, onConnect } from "@reatom/framework"
import { isEmptyArray } from "@/shared/lib/array"
import { NotFound } from "@/shared/ui/not-found"
import { isClientAtom } from "@/shared/models/global.model"
import { tv } from "tailwind-variants"

const NewsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 flex-col w-full h-full gap-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className={newsItemVariant().base()}>
          <Skeleton className="w-full h-full max-h-[100px] sm:max-h-[200px]" />
          <div className={newsItemVariant().content()}>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

onConnect(newsAction.dataAtom, newsAction)

const newsItemVariant = tv({
  base: `flex flex-col h-full w-full h-44 sm:h-72 hover:bg-neutral-800 duration-150 border border-neutral-800 rounded-lg overflow-hidden`,
  slots: {
    img: `object-cover max-h-[100px] sm:max-h-[200px]`,
    content: `flex flex-col gap-1 justify-between p-2 md:p-4 w-full`
  }
})

const NewsItem = ({ 
  id, description, title, imageUrl
}: NonNullable<AtomState<typeof newsAction.dataAtom>>["data"][number]) => {
  return (
    <div className={newsItemVariant().base()}>
      <img
        draggable={false}
        src={imageUrl!}
        alt=""
        width={1920}
        loading="lazy"
        height={1080}
        className={newsItemVariant().img()}
      />
      <div className={newsItemVariant().content()}>
        <Typography className="text-lg font-semibold text-nowrap truncate">
          {title}
        </Typography>
        <Link href={createLink("news", id)} className="w-fit">
          <Typography className="text-blue-500">
            подробнее
          </Typography>
        </Link>
      </div>
    </div>
  )
}

const NewsList = reatomComponent(({ ctx }) => {
  if (!ctx.spy(isClientAtom)) {
    return <NewsSkeleton />
  }

  const data = ctx.spy(newsAction.dataAtom)

  if (ctx.spy(newsAction.statusesAtom).isPending) {
    return <NewsSkeleton />
  }

  if (!data) return null;

  const isEmpty = isEmptyArray(data?.data)

  if (isEmpty) {
    return <NotFound title="Новостей нет" />
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 flex-col w-full h-full gap-4">
      {data.data.map(news => (
        <NewsItem key={news.id} {...news} />
      ))}
    </div>
  )
}, "NewsList")

export const News = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-bold">
        Новости проекта
      </Typography>
      <NewsList />
    </div>
  )
}