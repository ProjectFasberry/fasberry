import { pageContextAtom } from "@/shared/models/page-context.model"
import { PlayerLands } from "@/shared/components/app/player/components/lands"
import { PlayerSkin } from "@/shared/components/app/player/components/skin"
import { Balance } from "@/shared/components/app/player/components/balance";
import { PlayerInfo } from "@/shared/components/app/player/components/info";
import { PurchasesHistory } from "@/shared/components/app/player/components/details";
import { reatomComponent } from "@reatom/npm-react";
import { PlayerActivity } from "@/shared/components/app/player/components/activity";
import { isIdentityAtom, playerAtom, userParamAtom } from "@/shared/components/app/player/models/player.model";
import { Data } from "./+data";
import { PlayerSeemsLikePlayers } from "@/shared/components/app/player/components/seems-like-players";
import { PlayerSocials } from "@/shared/components/app/player/components/socials";

userParamAtom.onChange((ctx, state) => {
  if (!state) return;

  // The first element of the `history` array always represents an identifier
  // from 'targetUserAtom store that was initialized on the server.
  // When the page renders, the server-side function fills the store and
  // appends an entry to `userParamAtom`. All subsequent history updates
  // happen on the client side.
  const history = ctx.get(userParamAtom.history)

  if (history.length > 1) {
    const pageContext = ctx.get(pageContextAtom)
    if (!pageContext) return;

    const { data } = pageContext.data as Data
    playerAtom(ctx, data)
  }
})

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
  return (
    <div className="flex flex-col lg:flex-row relative w-full h-full items-start gap-8">
      <div className="flex flex-col justify-center items-center w-full gap-12 lg:w-[30%] lg:min-w-[30%] lg:sticky pt-2 lg:top-0">
        <PlayerSkin />
        <PlayerSocials />
      </div>
      <div className="flex flex-col w-full gap-12 lg:w-[70%] lg:min-w-[70%] h-full">
        <PlayerPublic />
        <PlayerPrivated />
      </div>
    </div>
  )
}