import { pageContextAtom } from "@/shared/models/global.model";
import { PageContext } from "vike/types";
import { Data } from "./+data";
import { atom } from "@reatom/core";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import dayjs from "dayjs";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { IconEye } from "@tabler/icons-react";
import { NewsType } from "@/shared/components/app/news/components/news";

const getNewsUrl = (id: string) => `/news/${id}`

const newsAtom = atom<NewsType | null>(null, "news")

pageContextAtom.onChange((ctx, state) => {
  if (!state) return;

  const target = state as PageContext<Data>
  const land = target.data?.news ?? null

  if (target.urlPathname === getNewsUrl(target.routeParams.id)) {
    newsAtom(ctx, land)
  }
})

const NewsItem = reatomComponent(({ ctx }) => {
  const data = ctx.spy(newsAtom)

  if (!data) return (
    <div className="flex justify-center items-center w-full h-full">
      <Typography className="font-semibold text-xl sm:text-2xl">
        Ресурс не найден
      </Typography>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-xl font-semibold">
        {data.title}
      </Typography>
      <Typography className="text-lg">
        {data.description}
      </Typography>
      <div className="flex justify-between items-center w-full">
        <Typography color="gray" className="text-md">
          {dayjs(data.created_at).format('D MMM YYYY')}
        </Typography>
        <div className="flex items-center gap-1">
          <Typography color="gray" className="text-md">
            {data.views}
          </Typography>
          <IconEye size={20} />
        </div>
      </div>
    </div>
  )
}, "NewsItem")

export default function NewsPage() {
  return (
    <MainWrapperPage>
      <NewsItem />
    </MainWrapperPage>
  )
}