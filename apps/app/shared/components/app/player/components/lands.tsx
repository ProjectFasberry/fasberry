import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { navigate } from "vike/client/router"
import { Land } from "@repo/shared/types/entities/land"
import { createLink } from "../../../config/link"
import { userLands } from "../models/player-lands.model"

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

const List = reatomComponent(({ ctx }) => {
  const data = ctx.spy(userLands.dataAtom)?.data

  if (!data) {
    return (
      <Typography color="gray" className="text-lg">
        нет
      </Typography>
    )
  }

  return data.map(land => <PlayerLand key={land.ulid} {...land} />)
}, "PlayerLandsList")

export const PlayerLands = reatomComponent(({ ctx }) => {
  const lands = ctx.spy(userLands.dataAtom)

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <h3 className="text-white font-semibold text-2xl">Территории</h3>
        <div className="w-8 flex items-center justify-center bg-neutral-800 h-8 rounded-full p-0.5">
          <span className="font-semibold text-lg">{lands?.meta?.count ?? 0}</span>
        </div>
      </div>
      {ctx.spy(userLands.statusesAtom).isPending && (
        <Skeleton className="h-24 w-full" />
      )}
      <List />
    </div>
  )
}, "PlayerLands")