"use client"

import { Typography } from "@repo/landing-ui/src/typography"
import { PlayerStatus } from "./player-status"
import { Skeleton } from "@repo/landing-ui/src/skeleton"
import { serverStatusQuery } from "./server-status"

export const PageServerStatus = () => {
  const { data, isLoading } = serverStatusQuery()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 w-full">
        <Skeleton className="w-full h-10" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </div>
      </div>
    )
  }

  const isServerOnline = data?.proxy.status === 'online'

  const playersList = data?.proxy.players
  const playersOnline = data?.proxy.online
  const playersMax = data?.proxy.max

  return (
    <>
      {!isServerOnline && (
        <Typography className="text-xl px-4 lg:text-2xl">
          Список игроков недоступен
        </Typography>
      )}
      {(isServerOnline && playersList) && (
        <>
          <Typography className="text-xl px-4 lg:text-2xl">
            Все игроки: {playersOnline}/{playersMax}
          </Typography>
          <div className="flex flex-col px-4 gap-2 h-full">
            {playersList.length === 0 && (
              <Typography className="px-2">
                тишина...
              </Typography>
            )}
            {playersList.map((nickname) =>
              <PlayerStatus key={nickname} nickname={nickname} />
            )}
          </div>
        </>
      )}
    </>
  )
}