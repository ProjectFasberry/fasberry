import { PlayerLands } from "@/shared/components/app/player/components/lands"
import { PlayerSkin } from "@/shared/components/app/player/components/skin"
import { Balance } from "@/shared/components/app/player/components/balance";
import { PlayerInfo } from "@/shared/components/app/player/components/info";
import { PurchasesHistory } from "@/shared/components/app/player/components/details";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { PlayerActivity } from "@/shared/components/app/player/components/activity";
import { isIdentityAtom, playerParamAtom } from "@/shared/components/app/player/models/player.model";
import { PlayerSeemsLikePlayers } from "@/shared/components/app/player/components/seems-like-players";
import { PlayerSocials } from "@/shared/components/app/player/components/socials";
import { usePageContext } from "vike-react/usePageContext";

const PlayerPrivated = reatomComponent(({ ctx }) => {
  const isIdentity = ctx.spy(isIdentityAtom)
  if (!isIdentity) return null;

  return (
    <>
      <Balance />
      <PurchasesHistory />
    </>
  )
}, "PlayerPrivated")

const PlayerPublic = () => {
  return (
    <>
      <PlayerInfo />
      <PlayerActivity />
      <PlayerLands />
      <PlayerSeemsLikePlayers />
    </>
  )
}

export default function Page() {
  const nickname = usePageContext().routeParams.nickname

  useUpdate((ctx) => playerParamAtom(ctx, nickname), [nickname])

  return (
    <div className="flex flex-col lg:flex-row relative w-full h-full items-start gap-8">
      <div
        className="flex flex-col justify-center items-center w-full gap-12 lg:w-[calc(30%-16px)] 
          lg:min-w-[calc(30%-16px)] lg:sticky pt-2 lg:top-0"
      >
        <PlayerSkin />
        <PlayerSocials />
      </div>
      <div className="flex flex-col w-full gap-12 lg:w-[calc(70%-16px)] lg:min-w-[calc(70%-16px)] h-full">
        <PlayerPublic />
        <PlayerPrivated />
      </div>
    </div>
  )
}