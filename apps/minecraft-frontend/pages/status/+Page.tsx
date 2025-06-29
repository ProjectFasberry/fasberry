import { PlayerStatus } from "@/shared/components/landing/status/player-status";
import { serverStatusResource } from "@/shared/components/landing/status/server-status";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Skeleton } from "@repo/ui/skeleton";
import { reatomComponent } from "@reatom/npm-react"

export const PageServerStatus = reatomComponent(({ ctx }) => {
  const data = ctx.spy(serverStatusResource.dataAtom)

  if (ctx.spy(serverStatusResource.statusesAtom).isPending) {
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
        <p className="text-xl px-4 lg:text-2xl">
          Список игроков недоступен
        </p>
      )}
      {(isServerOnline && playersList) && (
        <>
          <p className="text-xl px-4 lg:text-2xl">
            Все игроки: {playersOnline}/{playersMax}
          </p>
          <div className="flex flex-col px-4 gap-2 h-full">
            {playersList.length === 0 && (
              <p className="px-2">
                тишина...
              </p>
            )}
            {playersList.map((nickname) =>
              <PlayerStatus key={nickname} nickname={nickname} />
            )}
          </div>
        </>
      )}
    </>
  )
}, "PageServerStatus")

export default function StatusPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div className="full-screen-section min-h-screen flex items-center justify-center">
        <div className="flex h-full lg:max-h-[500px] flex-col lg:flex-row justify-start overflow-hidden items-start gap-6 responsive">
          <iframe
            src="https://discord.com/widget?id=958086036393689098&theme=dark"
            width="350"
            height="500"
            // @ts-ignore
            allowtransparency={true.toString()}
            className="!rounded-[12px] w-full lg:w-1/4"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
          <div
            className="flex flex-col max-h-[496px] overflow-y-scroll gap-6 rounded-xl py-4 border-2 
          border-neutral-600 bg-background-light dark:bg-background-dark w-full lg:w-3/4 h-full"
          >
            <PageServerStatus />
          </div>
        </div>
      </div>
    </MainWrapperPage>
  )
}