import { reatomComponent } from "@reatom/npm-react"
import { landAction, landAtom } from "../models/land.model"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/src/components/tabs"
import { Typography } from "@repo/ui/src/components/typography"
import dayjs from "dayjs"
import { LandMembers } from "./land-members"
// @ts-ignore
import Looking from '@repo/assets/images/looking.jpg'
import { AnotherLandsByOwner } from "./another-lands"
import { Skeleton } from "@repo/ui/src/components/skeleton"
import { MINECRAFT_MAP_SITE_DOMAIN } from "@repo/shared/constants/origin-list"
import { Avatar } from "@/components/avatar/components/avatar"

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
            <Typography>Основное</Typography>
          </TabsTrigger>
          <TabsTrigger value="members">
            <Typography>
              Участники
            </Typography>
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Typography>Статистика</Typography>
          </TabsTrigger>
          <TabsTrigger value="chunks">
            <Typography>Территории</Typography>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="flex flex-col pt-2 gap-2 w-full h-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Typography className="text-[24px] font-semibold font-[Minecraft]">
                {land.name}
              </Typography>
              {/* {land.title && <ColoredText className="font-[Minecraft]" text={land.title} />} */}
            </div>
          </div>
          <div className="flex flex-col gap-4 h-full w-full">
            <Typography className="text-[18px]">
              Создана: {dayjs(land.created_at).format('DD.MM.YYYY HH:mm')}
            </Typography>
            <Typography className="text-[18px]">Тип: {land.type}</Typography>
          </div>
        </TabsContent>
        <TabsContent value="members" className="flex flex-col pt-2 gap-4 w-full">
          <Typography className="text-[19px]" textColor="gray">
            Участники территории
          </Typography>
          <LandMembers />
        </TabsContent>
        <TabsContent value="chunks" className="flex flex-col pt-2 gap-4 w-full">
          <Typography className="text-[19px]" textColor="gray">
            Здесь отображается количество чанков и созданных областей внутри
            территории
          </Typography>
          <div className="flex flex-col gap-2 w-full h-full">
            <Typography className="text-[18px]">
              Чанков захвачено: {land.chunks_amount}
            </Typography>
            <Typography className="text-[18px]">
              Областей внутри территории: {land.areas_amount}
            </Typography>
          </div>
          <div className="flex items-center gap-4 w-full h-full">
            <a target="_blank" href={MINECRAFT_MAP_SITE_DOMAIN} rel="noreferrer" className="flex items-center justify-center px-6 py-2 rounded-md bg-shark-800">
              <Typography>Перейти к карте территории</Typography>
            </a>
          </div>
        </TabsContent>
        <TabsContent value="stats" className="flex flex-col pt-2 gap-4 w-full h-full">
          <Typography className="text-[19px]" textColor="gray">
            Здесь отображается основная статистика территории
          </Typography>
          <div className="flex flex-col gap-2 w-full h-full">
            <Typography className="text-[18px]">
              Убийств: {land.stats.kills}
            </Typography>
            <Typography className="text-[18px]">
              Смертей: {land.stats.deaths}
            </Typography>
            <Typography className="text-[18px]">
              Побед: {land.stats.wins}
            </Typography>
            <Typography className="text-[18px]">
              Захватов: {land.stats.captures}
            </Typography>
            <Typography className="text-[18px]">
              Поражений: {land.stats.defeats}
            </Typography>
          </div>
        </TabsContent>
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
          <Avatar nickname={land.members[0].nickname} propWidth={128} propHeight={128} />
          <Typography className="text-[24px] font-semibold font-[Minecraft]">
            {land.name}
          </Typography>
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