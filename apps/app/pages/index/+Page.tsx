import { eventsAction } from "@/shared/components/app/events/models/events.model";
import { News } from "@/shared/components/app/news/components/news";
import { newsAction } from "@/shared/components/app/news/models/news.model";
import { onConnect, reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";
import { Button } from "@repo/ui/button";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { BASE } from "@/shared/api/client";
import { Skeleton } from "@repo/ui/skeleton";
import { IconArrowRight } from "@tabler/icons-react";

const serverStatus = reatomResource(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await BASE("server/status", {
      searchParams: { type: "servers" }, signal: ctx.controller.signal, throwHttpErrors: false
    })

    const data = await res.json<WrappedResponse<StatusPayload>>()

    if ("error" in data) return null;

    return data.data
  })
}).pipe(withStatusesAtom(), withCache(), withDataAtom())

onConnect(newsAction.dataAtom, newsAction)
onConnect(eventsAction.dataAtom, eventsAction)
onConnect(serverStatus.dataAtom, serverStatus)

type StatusPayload = {
  proxy: {
    status: string;
    online: number;
    max: number;
    players: string[];
  };
  servers: {
    bisquite: {
      online: number;
      max: number;
      players: string[];
      status: string;
    };
  };
}

const IntroStatus = reatomComponent(({ ctx }) => {
  const data = ctx.spy(serverStatus.dataAtom);

  if (ctx.spy(serverStatus.statusesAtom).isPending && !ctx.spy(serverStatus.cacheAtom)) {
    return <Skeleton className="w-4 h-4 inline-flex rounded-sm" />
  }

  return data?.proxy.online ?? 0
}, "IntroStatus")

const IntroActions = reatomComponent(({ ctx }) => {
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
        <Typography className="truncate inline-flex items-center gap-2 text-base lg:text-lg font-semibold">
          Онлайн: <IntroStatus /> игроков
        </Typography>
      </div>
    </div>
  )
}, "IntroActions")

const CONTACTS = [
  {
    title: "Telegram",
    value: "tg",
    img: "https://cristalix.gg/content/icons/tg.svg",
    color: "bg-[#007CBD]",
    href: "https://t.me/fasberry",
  },
  {
    title: "VK",
    value: "vk",
    img: "https://cristalix.gg/content/icons/vk.svg",
    color: "bg-[#0b5aba]",
    href: "https://vk.com/fasberry",
  },
  {
    title: "Discord",
    value: "ds",
    img: "https://cristalix.gg/content/icons/discord.svg",
    color: "bg-[#5865F2]",
    href: "https://discord.gg/X4x6Unj89g",
  },
  {
    title: "X",
    value: "x",
    img: "https://cristalix.gg/content/icons/x.svg",
    color: "bg-black",
    href: "/",
  },
]

export default function IndexPage() {
  return (
    <MainWrapperPage>
      <div className='flex flex-col gap-8 w-full h-full'>
        <div id="intro" className="flex items-center relative rounded-lg overflow-hidden w-full max-h-[400px]">
          <img src={getStaticImage("arts/general-preview.jpg")} fetchPriority="high" alt="Start" />
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
        <News />
        {/* <Events /> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-auto gap-2 sm:gap-4 w-full">
          {CONTACTS.map((item, idx) => (
            <a
              href={item.href}
              key={idx}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-between p-4 group rounded-lg ${item.color}`}
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <img src={item.img} alt="TG" width={36} height={36} />
                <Typography className="truncate font-semibold text-lg lg:text-xl">
                  {item.title}
                </Typography>
              </div>
              <IconArrowRight size={36} className="duration-150 -rotate-45 group-hover:rotate-0" />
            </a>
          ))}
        </div>
      </div>
    </MainWrapperPage>
  )
}