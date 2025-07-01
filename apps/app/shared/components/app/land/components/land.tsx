import { reatomComponent } from "@reatom/npm-react"
import { landAtom, landOwnerAtom } from "../models/land.model"
import dayjs from "dayjs"
import { LandMembers } from "./land-members"
import Looking from '@repo/assets/images/looking.jpg'
import { AnotherLandsByOwner } from "./another-lands"
import { MINECRAFT_MAP_SITE_DOMAIN } from "@repo/shared/constants/origin-list"
import { Avatar } from "@/shared/components/app/avatar/avatar"
import { Skeleton } from "@repo/ui/skeleton"
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Typography } from "@repo/ui/typography"
import Allay from "@repo/assets/gifs/allay.gif"
import { Button } from "@repo/ui/button"

const LandLoading = () => {
  return (
    <div className="flex flex-col gap-4 w-3/5">
      <div className="flex items-start flex-col w-full">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex flex-col pt-2 gap-2 w-full h-full">
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

const Main = reatomComponent(({ ctx }) => {
  const land = ctx.spy(landAtom)

  if (!land) return null;

  return (
    <div className="flex order-last bg-neutral-900 rounded-md p-2 md:order-first flex-col gap-4 md:w-3/5 w-full">
      <Tabs defaultValue="general" className="flex items-start flex-col w-full">
        <TabsList className="gap-2 justify-start overflow-x-auto w-full">
          <TabsTrigger value="general">
            <p>Основное</p>
          </TabsTrigger>
          <TabsTrigger value="members">
            <p>
              Участники
            </p>
          </TabsTrigger>
          <TabsTrigger value="stats">
            <p>Статистика</p>
          </TabsTrigger>
          <TabsTrigger value="chunks">
            <p>Территории</p>
          </TabsTrigger>
        </TabsList>
        <TabsContents>
          <TabsContent value="general" className="flex flex-col pt-2 gap-2 w-full h-full">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-[24px] font-semibold">
                  {land.name}
                </p>
                {/* {land.title && <ColoredText text={land.title} />} */}
              </div>
            </div>
            <div className="flex flex-col gap-4 h-full w-full">
              <Typography className="text-lg">
                Создана: {dayjs(land.created_at).format('DD.MM.YYYY HH:mm')}
              </Typography>
              <p className="text-lg">Тип: {land.type}</p>
            </div>
          </TabsContent>
          <TabsContent value="members" className="flex flex-col pt-2 gap-4 w-full">
            <p className="text-lg text-neutral-400" >
              Участники территории
            </p>
            <LandMembers />
          </TabsContent>
          <TabsContent value="chunks" className="flex flex-col pt-2 gap-4 w-full">
            <p className="text-lg text-neutral-400">
              Здесь отображается количество чанков и созданных областей внутри
              территории
            </p>
            <div className="flex flex-col gap-2 w-full h-full">
              <p className="text-lg">
                Чанков захвачено: {land.chunks_amount}
              </p>
              <p className="text-lg">
                Областей внутри территории: {land.areas_amount}
              </p>
            </div>
            <div className="flex items-center gap-4 w-full h-full">
              <a target="_blank" href={MINECRAFT_MAP_SITE_DOMAIN} rel="noreferrer">
                <Button className="bg-neutral-50 w-fit">
                  <Typography color="black" className="font-semibold">
                    Перейти к карте территории
                  </Typography>
                </Button>
              </a>
            </div>
          </TabsContent>
          <TabsContent value="stats" className="flex flex-col pt-2 gap-4 w-full h-full">
            <p className="text-[19px] text-neutral-400">
              Здесь отображается основная статистика территории
            </p>
            <div className="flex flex-col gap-2 w-full h-full">
              <p className="text-lg">
                Убийств: {land.stats.kills}
              </p>
              <p className="text-lg">
                Смертей: {land.stats.deaths}
              </p>
              <p className="text-lg">
                Побед: {land.stats.wins}
              </p>
              <p className="text-lg">
                Захватов: {land.stats.captures}
              </p>
              <p className="text-lg">
                Поражений: {land.stats.defeats}
              </p>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
}, "Main")

const LandNotFound = () => {
  return (
    <div className="flex flex-col gap-4 justify-center w-full h-full items-center">
      <img src={Allay} height={102} width={102} alt="" />
      <Typography className="font-semibold text-base sm:text-xl">
        Похоже этого региона уже нет :/
      </Typography>
      <Button onClick={() => window.history.back()} className='bg-neutral-50 w-fit'>
        <Typography color="black" className="font-semibold px-6">
          Назад
        </Typography>
      </Button>
    </div>
  )
}

const Panel = reatomComponent(({ ctx }) => {
  const land = ctx.spy(landAtom)
  const landOwner = ctx.spy(landOwnerAtom)

  if (!land || !landOwner) {
    return <LandNotFound />
  }

  return (
    <div className="flex flex-col items-center overflow-hidden justify-start gap-4 w-full md:w-2/5 md:h-full">
      <div className="flex flex-col rounded-md items-center overflow-hidden justify-end relative gap-4 w-full">
        <div
          className="absolute h-1/3 bg-gradient-to-t rounded-md from-black/40 z-[1] via-black/40 
            to-transparent backdrop-blur-sm w-full bottom-0"
        />
        <img
          src={Looking}
          width={600}
          height={600}
          alt=""
          loading="lazy"
          className="absolute w-full rounded-md h-[400px] object-cover"
        />
        <div className="flex flex-col items-center justify-end gap-2 z-[2] pb-2 w-full h-[300px]">
          <Avatar nickname={landOwner} propWidth={128} propHeight={128} />
          <Typography color="white" className="text-xl lg:text-2xl font-semibold">
            {land.name}
          </Typography>
        </div>
      </div>
      <AnotherLandsByOwner />
    </div >
  )
}, "Panel")

export const Land = () => {
  return (
    <div className="flex md:flex-row flex-col gap-6 w-full h-full">
      <Main />
      <Panel />
    </div>
  )
}