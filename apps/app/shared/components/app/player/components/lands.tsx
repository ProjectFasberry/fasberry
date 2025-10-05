import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { navigate } from "vike/client/router"
import { Land } from "@repo/shared/types/entities/land"
import { createLink } from "../../../config/link"
import { playerLandsAction, playerLandsAtom } from "../models/player-lands.model"
import { atom } from "@reatom/core"

const PlayerLand = ({ ulid, title, name, members, chunks_amount }: Land) => {
  return (
    <div
      onClick={() => navigate(createLink("land", ulid))}
      className="flex p-2 lg:p-4 border 
        hover:bg-neutral-800 duration-150 ease-in-out border-neutral-800 cursor-pointer rounded-md"
    >
      <div className="flex flex-col w-full lg:w-3/4">
        <Typography className="text-lg font-semibold">
          {name}
        </Typography>
        <div className="flex flex-col gap-1">
          <span className="text-base text-neutral-400">{members.length} {members.length > 1 ? "участника" : "участник"}</span>
        </div>
      </div>
      <div className="hidden lg:flex flex-col w-1/4">
        
      </div>
    </div>
  )
}

const PlayerLandsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(playerLandsAtom)?.data

  if (ctx.spy(playerLandsAction.statusesAtom).isPending) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!data) {
    return <Typography color="gray" className="text-lg">нет</Typography>
  }

  return (
    data.map(land => <PlayerLand key={land.ulid} {...land} />)
  )
}, "PlayerLandsList")

const playerLandsCountAtom = atom((ctx) => ctx.spy(playerLandsAtom)?.meta.count ?? 0, "playerLandsCount")

const PlayerLandsCount = reatomComponent(({ ctx }) => {
  const data = ctx.spy(playerLandsCountAtom)

  return (
    <div className="w-8 flex items-center justify-center bg-neutral-800 h-8 rounded-full p-0.5">
      <span className="font-semibold text-lg">
        {data}
      </span>
    </div>
  )
}, "PlayerLandsCount")

export const PlayerLands = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <h3 className="text-white font-semibold text-2xl">Территории</h3>
        <PlayerLandsCount />
      </div>
      <PlayerLandsList />
    </div>
  )
}