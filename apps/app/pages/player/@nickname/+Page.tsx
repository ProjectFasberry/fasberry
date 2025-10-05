import { skinAction } from "@/shared/components/app/skin/models/skin.model"
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { pageContextAtom } from "@/shared/models/global.model"
import { PlayerLands } from "@/shared/components/app/player/components/lands"
import { Logout } from "@/shared/components/app/player/components/logout"
import { PlayerSkin } from "@/shared/components/app/player/components/skin"
import { Balance } from "@/shared/components/app/player/components/balance";
import { PlayerInfo } from "@/shared/components/app/player/components/info";
import { PlayerAttributes } from "@/shared/components/app/player/components/attributes";
import { Details } from "@/shared/components/app/player/components/details";
import { useUpdate } from "@reatom/npm-react";
import { PlayerActivity } from "@/shared/components/app/player/components/activity";
import { playerActivityAction } from "@/shared/components/app/player/models/activity.model";
import { action } from "@reatom/core";
import { startPageEvents } from "@/shared/lib/events";
import { targetUserAtom, userParamAtom } from "@/shared/components/app/player/models/player.model";
import { Data } from "./+data";

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

    const data = pageContext.data as Data
    targetUserAtom(ctx, data.user)
  }
})

const events = action((ctx) => {
  skinAction(ctx)
  playerActivityAction(ctx)
}, "events")

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events, { urlTarget: "player" }), [pageContextAtom]);

  return (
    <MainWrapperPage>
      <div className="flex flex-col lg:flex-row relative w-full h-full items-start gap-8">
        <PlayerSkin />
        <div className="flex flex-col w-full gap-12 lg:w-2/3 h-full">
          <>
            <PlayerInfo />
            <PlayerActivity />
            <PlayerAttributes />
            <PlayerLands />
          </>
          <>
            <Balance />
            <Details />
            <Logout />
          </>
        </div>
      </div>
    </MainWrapperPage>
  )
}