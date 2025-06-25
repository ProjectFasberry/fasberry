import { reatomComponent } from "@reatom/npm-react"
import { landAction, landAtom } from "../models/land.model"
import dayjs from "dayjs"
import { LandMembers } from "./land-members"
// @ts-ignore
import Looking from '@repo/assets/images/looking.jpg'
import { AnotherLandsByOwner } from "./another-lands"
import { MINECRAFT_MAP_SITE_DOMAIN } from "@repo/shared/constants/origin-list"
import { Avatar } from "@/shared/components/app/avatar/avatar"
import { Skeleton } from "@/shared/ui/skeleton"
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/ui/tabs"

const Main = reatomComponent(({ ctx }) => {
  const land = ctx.spy(landAtom)

  if (ctx.spy(landAction.statusesAtom).isPending) {
    return (
      <div className="flex flex-col gap-4 w-3/5 !p-4">
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

  if (!land) return null;

  return (
    <div className="flex order-last md:order-first flex-col gap-4 md:w-3/5 w-full !p-4">
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
                <p className="text-[24px] font-semibold font-[Minecraft]">
                  {land.name}
                </p>
                {/* {land.title && <ColoredText className="font-[Minecraft]" text={land.title} />} */}
              </div>
            </div>
            <div className="flex flex-col gap-4 h-full w-full">
              <p className="text-[18px]">
                Создана: {dayjs(land.created_at).format('DD.MM.YYYY HH:mm')}
              </p>
              <p className="text-[18px]">Тип: {land.type}</p>
            </div>
          </TabsContent>
          <TabsContent value="members" className="flex flex-col pt-2 gap-4 w-full">
            <p className="text-[19px] text-neutral-400" >
              Участники территории
            </p>
            <LandMembers />
          </TabsContent>
          <TabsContent value="chunks" className="flex flex-col pt-2 gap-4 w-full">
            <p className="text-[19px] text-neutral-400">
              Здесь отображается количество чанков и созданных областей внутри
              территории
            </p>
            <div className="flex flex-col gap-2 w-full h-full">
              <p className="text-[18px]">
                Чанков захвачено: {land.chunks_amount}
              </p>
              <p className="text-[18px]">
                Областей внутри территории: {land.areas_amount}
              </p>
            </div>
            <div className="flex items-center gap-4 w-full h-full">
              <a target="_blank" href={MINECRAFT_MAP_SITE_DOMAIN} rel="noreferrer" className="flex items-center justify-center px-6 py-2 rounded-md bg-shark-800">
                <p>Перейти к карте территории</p>
              </a>
            </div>
          </TabsContent>
          <TabsContent value="stats" className="flex flex-col pt-2 gap-4 w-full h-full">
            <p className="text-[19px] text-neutral-400">
              Здесь отображается основная статистика территории
            </p>
            <div className="flex flex-col gap-2 w-full h-full">
              <p className="text-[18px]">
                Убийств: {land.stats.kills}
              </p>
              <p className="text-[18px]">
                Смертей: {land.stats.deaths}
              </p>
              <p className="text-[18px]">
                Побед: {land.stats.wins}
              </p>
              <p className="text-[18px]">
                Захватов: {land.stats.captures}
              </p>
              <p className="text-[18px]">
                Поражений: {land.stats.defeats}
              </p>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
})

const Panel = reatomComponent(({ ctx }) => {
  const land = ctx.spy(landAtom)

  if (!land) return <span>Упс, похоже этого региона уже нет :/</span>

  return (
    <div className="flex flex-col items-center overflow-hidden justify-start gap-4 w-full md:w-2/5 md:h-full">
      <div className="flex flex-col items-center overflow-hidden justify-end relative !p-0 gap-4 w-full">
        <div
          className="absolute h-1/3 bg-gradient-to-t rounded-md from-black/40 z-[1] via-black/40 to-transparent backdrop-blur-sm w-full bottom-0"
        />
        <img
          src={Looking}
          width={600}
          height={600}
          alt=""
          className="absolute w-full h-[400px] object-cover"
        />
        <div className="flex flex-col items-center justify-end gap-2 z-[2] pb-2 w-full h-[300px]">
          <Avatar url={null} nickname={land.members[0].nickname} propWidth={128} propHeight={128} />
          <p className="text-[24px] font-semibold font-[Minecraft]">
            {land.name}
          </p>
        </div>
      </div>
      <AnotherLandsByOwner />
    </div >
  )
})

export const Land = () => {
  return (
    <div className="flex md:flex-row flex-col gap-6 w-full h-full">
      <Main />
      <Panel />
    </div>
  )
}