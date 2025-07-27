import { skinAction } from "@/shared/components/app/skin/models/skin.model"
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { isSsrAtom, pageContextAtom } from "@/shared/models/global.model"
import { PageContext } from "vike/types"
import { Data } from "./+data"
import { PlayerLands } from "@/shared/components/app/player/components/lands"
import { Logout } from "@/shared/components/app/player/components/logout"
import { PlayerSkin } from "@/shared/components/app/player/components/skin"
import { userLands } from "@/shared/components/app/player/models/player-lands.model";
import { targetUserAtom } from "@/shared/components/app/player/models/player.model";
import { PlayerBalance } from "@/shared/components/app/player/components/balance";
import { PlayerInfo } from "@/shared/components/app/player/components/info";
import { PlayerAttributes } from "@/shared/components/app/player/components/attributes";
import { PlayerActivity } from "@/shared/components/app/player/components/activity";
import { reatomComponent } from "@reatom/npm-react";
import { PageLoader } from "@/shared/ui/page-loader";

const getUserUrl = (id: string) => `/player/${id}`

pageContextAtom.onChange((ctx, state) => {
  if (!state) return;

  if (!state.urlPathname.includes("/player")) return;

  const target = state as PageContext<Data>

  if (target.urlPathname === getUserUrl(target.routeParams.nickname)) {
    userLands(ctx, target.data.nickname)
    targetUserAtom(ctx, target.data.user)
    skinAction(ctx)
  }
})

const Content = reatomComponent(({ ctx }) => {
  if (ctx.spy(isSsrAtom)) {
    return <PageLoader />
  }

  return (
    <div className="flex flex-col lg:flex-row relative w-full h-full items-start gap-8">
      <PlayerSkin />
      <div className="flex flex-col w-full gap-12 lg:w-2/3 h-full">
        <PlayerInfo />
        <PlayerAttributes />
        <PlayerLands />
        <PlayerBalance />
        <PlayerActivity />
        <Logout />
      </div>
    </div >
  )
}, "PlayerPageContent")

export default function PlayerPage() {
  return (
    <MainWrapperPage>
      <Content />
    </MainWrapperPage>
  )
}