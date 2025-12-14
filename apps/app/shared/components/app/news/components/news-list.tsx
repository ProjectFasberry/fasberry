import { atom } from "@reatom/core"
import { newsAllAction, newsAllDataArrAtom, newsIsViewAtom, newsSearchQueryAtom } from "../models/news-list.model"
import { NotFound } from "@/shared/ui/not-found"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { PageLoader } from "@/shared/ui/page-loader"
import { isEmptyArray } from "@/shared/lib/array"
import { Typography } from "@repo/ui/typography"
import { createLink, Link } from "@/shared/components/config/link"
import { useInView } from "react-intersection-observer"

const newsNotFoundTitleAtom = atom((ctx) => {
  const sq = ctx.get(newsSearchQueryAtom)
  if (sq) return `Ничего не нашлось по запросу "${sq}"`

  return "Пока ничего нет"
}, "newsNotFoundTitle")

const NewsListNotFound = reatomComponent(({ ctx }) => <NotFound title={ctx.spy(newsNotFoundTitleAtom)} />)

export const NewsList = reatomComponent(({ ctx }) => {
  useUpdate(newsAllAction, [])

  if (ctx.spy(newsAllAction.statusesAtom).isPending) {
    return <PageLoader />
  }

  const data = ctx.spy(newsAllDataArrAtom);

  const isEmpty = isEmptyArray(data)
  if (isEmpty) return <NewsListNotFound />

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 auto-rows-auto gap-2 sm:gap-4 w-full h-full">
      {data.map((news) => (
        <div key={news.id} className="flex flex-col gap-4 border border-neutral-800 w-full rounded-lg p-3 sm:p-4">
          <div className="h-20 sm:h-36 w-full overflow-hidden rounded-lg">
            <img src={news.imageUrl} loading="lazy" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <Typography className="text-lg leading-5 font-semibold truncate">
              {news.title}
            </Typography>
            <Link href={createLink("news", news.id)}>
              <Typography className="text-neutral-400 font-semibold text-sm">
                прочитать
              </Typography>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}, "NewsList")

export const NewsViewer = () => {
  const { ref, inView } = useInView()
  useUpdate((ctx) => newsIsViewAtom(ctx, inView), [inView])
  return <div ref={ref} className="h-[1px] w-full" />
}