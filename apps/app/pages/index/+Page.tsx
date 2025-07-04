import { currentUserAtom } from "@/shared/api/global.model";
import { Events } from "@/shared/components/app/events/components/events";
import { eventsAction } from "@/shared/components/app/events/models/events.model";
import { News } from "@/shared/components/app/news/components/news";
import { newsAction } from "@/shared/components/app/news/models/news.model";
import { AuthorizeButton } from "@/shared/layouts/header";
import { onConnect } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Typography } from "@repo/ui/typography";

onConnect(newsAction.dataAtom, newsAction)
onConnect(eventsAction.dataAtom, eventsAction)

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