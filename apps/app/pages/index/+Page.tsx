import { BASE } from "@/shared/api/client";
import { currentUserAtom } from "@/shared/api/global.model";
import { Link } from "@/shared/components/config/Link";
import { AuthorizeButton } from "@/shared/layouts/header";
import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { onConnect, sleep } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";

const newsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    await sleep(100)

    const res = await BASE("shared/news", { throwHttpErrors: false, signal: ctx.controller.signal })
    const data = await res.json<{ data: News[], meta: PaginatedMeta } | { error: string }>()

    if ("error" in data) {
      return null;
    }

    return data.data;
  })
}).pipe(withDataAtom(), withStatusesAtom())

const EVENTS = [
  {
    type: "register",
    log: `Игрок distribate зарегистрировался`
  },
  {
    type: "update-news",
    log: `Игрок distribate опубликовал новость`
  },
] as const;

const EVENTS_TITLE_MAP: Record<(typeof EVENTS)[number]["type"], string> = {
  "register": "Регистрация",
  "update-news": "Новость"
}

const eventsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    await sleep(120);

    return EVENTS
  })
}).pipe(withDataAtom(), withStatusesAtom())


onConnect(newsAction.dataAtom, newsAction)
onConnect(eventsAction.dataAtom, eventsAction)

export type News = {
  id: string,
  title: string
  created_at: string,
  description: string,
  imageUrl: string,
  views: number
}

const Events = reatomComponent(({ ctx }) => {
  const data = ctx.spy(eventsAction.dataAtom)

  const List = () => {
    if (!data) return null;

    return (
      data.map((event, idx) => (
        <div key={idx} className="flex flex-col gap-1 bg-neutral-800 rounded-md px-2 py-2 h-[80px] w-auto">
          <div className="bg-neutral-50 flex justify-start items-center w-fit rounded-sm px-2 py-0.5">
            <Typography color="black" className="text-base font-semibold">
              {EVENTS_TITLE_MAP[event.type]}
            </Typography>
          </div>
          <Typography className="text-lg truncate">
            {event.log}
          </Typography>
        </div>
      ))
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-semibold">
        Последние события
      </Typography>
      <div className="flex overflox-x-auto gap-2 pb-2 overflow-y-hidden w-full">
        {ctx.spy(eventsAction.statusesAtom).isPending ? (
          <>
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="h-[80px] w-full" />
          </>
        ) : <List />}
      </div>
    </div>
  )
}, "Events")

const News = reatomComponent(({ ctx }) => {
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

const Auth = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)

  if (currentUser) return null;

  return (
    <div className="flex flex-col gap-4 w-fit h-full">
      <Typography className="text-3xl font-semibold">
        Еще не зарегистрированы на проекте?
      </Typography>
      <AuthorizeButton />
    </div>
  )
}, "Auth")

export default function IndexPage() {
  return (
    <MainWrapperPage>
      <div className='flex flex-col gap-8 w-full h-full'>
        <Auth />
        <News />
        <Events />
      </div>
    </MainWrapperPage>
  )
}