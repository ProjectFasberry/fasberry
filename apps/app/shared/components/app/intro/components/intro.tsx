import { getStaticImage } from "@/shared/lib/volume-helpers";
import { onConnect } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";
import { serverStatusAction } from "../models/intro.model";

onConnect(serverStatusAction.dataAtom, serverStatusAction)

const IntroStatus = reatomComponent(({ ctx }) => {
  const data = ctx.spy(serverStatusAction.dataAtom);

  if (ctx.spy(serverStatusAction.statusesAtom).isPending) {
    return <Skeleton className="w-4 h-4 inline-flex rounded-sm" />
  }

  return (
    <Typography>
      {data?.proxy.online ?? 0}
    </Typography>
  )
}, "IntroStatus")

const IntroActions = () => {
  return (
    <div className="flex bottom-0 gap-4 absolute w-full items-center p-3 md:p-4 lg:p-6">
      <a href="https://mc.fasberry.su/start" target="_blank">
        <Button className="bg-neutral-50">
          <Typography className="text-nowrap text-base lg:text-lg text-neutral-950 font-semibold">
            Начать играть
          </Typography>
        </Button>
      </a>
      <div className="hidden sm:flex items-center px-4 py-2 rounded-md bg-neutral-800 cursor-default">
        <div className="flex items-center gap-1 *:inline *:truncate *:items-center *:gap-2 *:text-base *:lg:text-lg *:font-semibold">
          <Typography>
            Онлайн:
          </Typography>
          <IntroStatus />
          <Typography>
            игроков
          </Typography>
        </div>
      </div>
    </div>
  )
}

const introImage = getStaticImage("arts/general-preview.jpg");

export const Intro = () => {  
  return (
    <div
      id="intro"
      className="flex items-center relative rounded-lg overflow-hidden w-full md:h-[400px] max-h-[400px]"
    >
      <img
        src={introImage}
        fetchPriority="high"
        alt="Start"
      />
      <div className="flex select-none items-center gap-2 lg:gap-4 absolute top-0 p-3 md:p-4 lg:p-6">
        <img
          src="/favicon.ico"
          draggable={false}
          width={64}
          height={64}
          alt=""
          className="w-auto h-auto max-h-[64px] max-w-[64px]"
        />
        <Typography className="text-xl md:text-2xl lg:text-4xl font-semibold">
          Fasberry
        </Typography>
      </div>
      <IntroActions />
    </div>
  )
}