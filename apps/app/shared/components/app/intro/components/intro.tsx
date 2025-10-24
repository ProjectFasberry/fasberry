import { getStaticImage } from "@/shared/lib/volume-helpers";
import { onConnect, sleep } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";
import { serverStatusAction } from "../models/intro.model";
import { LANDING_ENDPOINT } from "@/shared/env";
import { expImage } from "@/shared/consts/images";

onConnect(serverStatusAction.dataAtom, serverStatusAction)

onConnect(serverStatusAction.dataAtom, async (ctx) => {
  while (ctx.isConnected()) {
    await serverStatusAction.retry(ctx).catch(() => { })
    await ctx.schedule(() => sleep(60000))
  }
})

const IntroStatus = reatomComponent(({ ctx }) => {
  const data = ctx.spy(serverStatusAction.dataAtom);

  if (ctx.spy(serverStatusAction.statusesAtom).isPending) {
    return <Skeleton className="w-4 h-4 inline-flex rounded-sm" />
  }

  return (
    <Typography className="text-lg">
      {data?.proxy.online ?? 0}
    </Typography>
  )
}, "IntroStatus")

const introImage = getStaticImage("arts/general-preview.jpg");

export const Intro = () => {
  return (
    <div
      id="intro"
      className="flex flex-col items-center relative rounded-xl overflow-hidden w-full md:h-96 min-h-72 max-h-80"
    >
      <img
        src={introImage}
        fetchPriority="high"
        draggable={false}
        alt="Start"
        className="absolute select-none w-full h-full object-cover z-[1]"
      />
      <div className="flex flex-col z-[2] justify-between p-3 md:p-4 grow lg:p-6 h-full w-full relative">
        <div className="flex flex-col items-start gap-4 w-full">
          <Typography className="text-xl font-semibold">
            Добро пожаловать!
          </Typography>
          <Typography className="text-2xl font-bold leading-tight">
            Fasberry Project
          </Typography>
          <Typography className="text-base leading-tight truncate md:max-w-2/3 xl:max-w-2/5 text-wrap">
            Присоединяйтесь к сообществу Fasberry, развивайтесь и проводите время в теплой и уютной компании!
          </Typography>
        </div>
        <div className="flex flex-col gap-2 sm:gap-4 w-full items-start justify-end h-full">
          <div className="flex items-center gap-1">
            <img src={expImage} width={20} height={20} alt="" />
            <IntroStatus />
            <Typography className="text-lg">
              играют сейчас
            </Typography>
          </div>
          <div className="flex gap-4 w-full items-center">
            <a href={`${LANDING_ENDPOINT}/start`} target="_blank">
              <Button className="bg-neutral-50 rounded-xl">
                <Typography className="truncate text-nowrap text-lg text-neutral-950 font-semibold">
                  Начать играть
                </Typography>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}