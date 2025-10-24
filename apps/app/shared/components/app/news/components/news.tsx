import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { newsAction, newsDataAtom } from "../models/news.model"
import { createLink, Link } from "@/shared/components/config/link"
import { AtomState, onConnect } from "@reatom/framework"
import { NotFound } from "@/shared/ui/not-found"
import { isClientAtom } from "@/shared/models/page-context.model"
import { tv } from "tailwind-variants"
import { scrollableVariant } from "@/shared/consts/style-variants"

const NewsSkeleton = () => {
  return Array.from({ length: 3 }).map((_, idx) => (
    <div key={idx} className={newsItemVariant().base()}>
      <Skeleton className="w-full h-[200px]" />
      <div className={newsItemVariant().content()}>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  ))
}

const newsItemVariant = tv({
  base: `flex flex-col flex-shrink-0 w-full sm:w-96 h-56 sm:h-72 border border-neutral-800 rounded-xl overflow-hidden`,
  slots: {
    img: `object-cover h-[148px] sm:h-[200px]`,
    content: `flex flex-col gap-1 justify-between p-2 sm:p-4 w-full`
  }
})

const NewsItem = ({
  id, description, title, imageUrl
}: NonNullable<AtomState<typeof newsDataAtom>>[number]) => {
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

onConnect(newsDataAtom, newsAction);

const NewsList = reatomComponent(({ ctx }) => {
  if (!ctx.spy(isClientAtom)) {
    return <NewsSkeleton />
  }

  const data = ctx.spy(newsDataAtom)

  if (ctx.spy(newsAction.statusesAtom).isPending) {
    return <NewsSkeleton />
  }

  if (!data) {
    return <NotFound title="Новостей нет" />
  }

  return data.map(news => <NewsItem key={news.id} {...news} />)
}, "NewsList")

export const News = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-bold">
        Новости
      </Typography>
      <div className={scrollableVariant({ className: "flex overflow-x-auto gap-4 pb-2" })}>
        <NewsList />
      </div>
    </div>
  )
}