import { Link } from "@/shared/components/config/Link";
import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { toast } from "sonner";
import { FORUM_SHARED_API } from "@repo/shared/constants/api";
import { reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { reatomComponent } from "@reatom/npm-react";
import { actionCopyboard } from "@/shared/lib/copyboard-helpers";
import { Typography } from "@/shared/ui/typography";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/shared/ui/tooltip";

const NumericItem = ({ index }: { index: number }) => {
  return (
    <div className="flex items-center justify-center border-2 aspect-square border-shark-800 h-8 w-8 lg:h-12 lg:w-12">
      <p className="text-black dark:text-white text-xl lg:text-2xl">
        {index}
      </p>
    </div>
  )
}

async function getServerIp(): Promise<string | null> {
  const res = await FORUM_SHARED_API("get-server-ip").json<{ data: { ip?: string } } | { error: string }>()
  if ("error" in res) return null;
  return res.data?.ip ?? null;
}

const serverIpResource = reatomResource(async (ctx) => {
  return await ctx.schedule(() => getServerIp())
}).pipe(withDataAtom(), withCache(), withStatusesAtom())

const ServerIp = reatomComponent(({ ctx }) => {
  const ip = ctx.spy(serverIpResource.dataAtom)
  const isLoading = ctx.spy(serverIpResource.statusesAtom).isPending

  const handle = async () => {
    if (!ip) return;

    await actionCopyboard(ip)
    toast.success("IP успешно скопирован!")
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={1}>
        <TooltipTrigger>
          <div className="flex items-center justify-start bg-black w-full py-2 px-2 border-2 border-neutral-500">
            <Typography onClick={handle} color="white" className="text-base text-left">
              {isLoading ? "загрузка..." : ip ? ip : "недоступно"}
            </Typography>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <Typography color="gray" className="text-lg">Скопировать IP</Typography>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

const HowToConnectOnServer = () => {
  return (
    <div
      className="flex justify-center items-center bg-repeat border-4 bg-black/20 p-4 relative border-black h-full w-full"
    >
      <div className="flex flex-col gap-y-6 justify-between md:w-96 w-full">
        <div className="flex flex-col gap-y-2 w-full">
          <Typography color="gray" className="text-base">
            Название сервера
          </Typography>
          <div className="bg-black py-2 px-2 border-2 border-neutral-500 w-full">
            <Typography className="text-left text-base text-white">
              Сервер Minecraft
            </Typography>
          </div>
          <Typography color="gray" className="text-base">
            Адрес сервера
          </Typography>
          <ServerIp />
        </div>
        <div className="flex flex-col gap-y-2">
          <TooltipProvider>
            <Tooltip delayDuration={1}>
              <TooltipTrigger>
                <div className="flex items-center justify-start bg-black w-full py-2 px-2 border-2 border-neutral-500">
                  <Typography
                    className="text-center text-shadow-xl text-shadow-xl text-[0.8rem] lg:text-base text-white"
                  >
                    Наборы ресурсов: Включены
                  </Typography>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <Typography color="gray" className="text-lg">
                  На сервере используется ресурспак. Эту нужно оставить включенным!
                </Typography>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="bg-neutral-800 cursor-pointer border-2 border-neutral-500 w-full px-2 py-1">
            <Typography className="text-center text-shadow-xl text-[0.8rem] text-white lg:text-base">
              Готово
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StartPage() {
  return (
    <MainWrapperPage>
      <div className="flex flex-col items-center w-full gap-12 h-full">
        <p className="text-project-color text-2xl lg:text-4xl">
          Как начать играть
        </p>
        <div className="flex flex-col gap-6 items-center h-full w-full">
          <div className="flex items-start gap-4 w-full">
            <NumericItem index={1} />
            <p className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
              <Link
                href="/auth"
                className="text-green text-shadow-lg hover:underline-offset-8 hover:underline"
              >
                Зарегистрироваться
              </Link>&nbsp;на проекте.
              После регистрации убедитесь, что вы успешно вошли на форум и личный кабинет.
            </p>
          </div>
        </div>
        <div className="flex flex-col h-full w-full gap-4">
          <div className="flex items-start gap-4 w-full">
            <NumericItem index={2} />
            <div className="flex flex-col">
              <p className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
                Зайди в клиент майнкрафта под ником, который вы указали при регистрации
              </p>
              <span className="text-black dark:text-white text-md md:text-xl lg:text-2xl mt-4">P.S:</span>
              <p className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
                Если пиратка, рекомендую: <Link href="https://llaun.ch/ru" className="text-neutral-600 dark:text-neutral-400">*тык</Link>
              </p>
              <p className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
                Если лицензия, рекомендую: <Link href="https://modrinth.com/app" className="text-neutral-600 dark:text-neutral-400">*тык</Link>
              </p>
            </div>
          </div>
          <div className="flex h-full lg:h-screen relative w-full">
            <div
              className="absolute w-full h-full lg:h-screen left-0 right-0 top-0 bottom-0"
              style={{ backgroundImage: `url("images/static/dirt.webp")` }}
            />
            <HowToConnectOnServer />
          </div>
        </div>
        <div className="flex items-start gap-4 w-full">
          <NumericItem index={3} />
          <p className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
            Удачной игры! <span className="text-red">❤</span>
          </p>
        </div>
      </div>
    </MainWrapperPage>
  )
}