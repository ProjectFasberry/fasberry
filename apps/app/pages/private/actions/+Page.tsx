import { newsAction } from "@/shared/components/app/news/models/news.model"
import {  BannersList, CreateBanner, CreateBannerFields, CreateEvent, CreateNews, CreateNewsFields, NewsList } from "@/shared/components/app/private/components/actions"
import { bannersAction } from "@/shared/components/app/private/models/actions.model"
import { startPageEvents } from "@/shared/lib/events"
import { pageContextAtom } from "@/shared/models/global.model"
import { action } from "@reatom/core"
import { useUpdate } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"

const events = action((ctx) => {
  newsAction(ctx);
  bannersAction(ctx)
}, "events")

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [pageContextAtom])

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-full p-4 rounded-xl bg-neutral-800/40">
        <Typography className="text-lg">
          Создать ивенты
        </Typography>
        <CreateEvent />
      </div>
      <div className="flex flex-col gap-4 w-full h-full p-4 rounded-xl bg-neutral-800/40">
        <Typography className="text-lg">
          Баннеры
        </Typography>
        <BannersList />
        <div className="flex flex-col gap-2">
          <CreateBannerFields />
          <CreateBanner />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full h-full p-4 rounded-xl bg-neutral-800/40">
        <Typography className="text-lg">
          Новости
        </Typography>
        <NewsList />
        <div className="flex flex-col gap-2">
          <CreateNewsFields />
          <CreateNews />
        </div>
      </div>
    </>
  )
}