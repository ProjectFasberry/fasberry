import { pageContextAtom } from "@/shared/models/page-context.model"
import { PlayerLands } from "@/shared/components/app/player/components/lands"
import { Logout } from "@/shared/components/app/player/components/logout"
import { PlayerSkin } from "@/shared/components/app/player/components/skin"
import { Balance } from "@/shared/components/app/player/components/balance";
import { PlayerInfo } from "@/shared/components/app/player/components/info";
import { PlayerAttributes } from "@/shared/components/app/player/components/attributes";
import { ChangePassword, PurchasesHistory } from "@/shared/components/app/player/components/details";
import { reatomComponent } from "@reatom/npm-react";
import { PlayerActivity } from "@/shared/components/app/player/components/activity";
import { isIdentityAtom, playerAtom, userParamAtom } from "@/shared/components/app/player/models/player.model";
import { Data } from "./+data";
import { Separator } from "@repo/ui/separator";
import { PlayerSeemsLikePlayers } from "@/shared/components/app/player/components/seems-like-players";
import { Typography } from "@repo/ui/typography";

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
    <div className="flex flex-col gap-6 p-4 rounded-xl border border-neutral-800">
      <Typography className="text-neutral-400 text-sm">
        Видно только вам
      </Typography>
      <div className="flex flex-col gap-4 w-full h-full">
        <Balance />
        <div className="flex flex-col gap-6 w-full h-fit">
          <PurchasesHistory />
        </div>
        <div className="flex flex-col w-full gap-4">
          <Separator />
          <ChangePassword />
        </div>
        <div className="flex flex-col w-full gap-4">
          <Separator />
          <Logout />
        </div>
      </div>
    </div>
  )
}, "PlayerPrivated")

const PlayerPublic = () => {
  return (
    <>
      <PlayerInfo />
      <PlayerActivity />
      <PlayerAttributes />
      <PlayerLands />
      <PlayerSeemsLikePlayers />
    </>
  )
}

export default function Page() {
  return (
    <div className="flex flex-col lg:flex-row relative w-full h-full items-start gap-8">
      <PlayerSkin />
      <div className="flex flex-col w-full gap-12 lg:w-2/3 h-full">
        <PlayerPublic />
        <PlayerPrivated />
      </div>
    </div>
  )
}