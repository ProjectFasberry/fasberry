import { Skeleton } from "@repo/ui/skeleton";
import { tv } from "tailwind-variants";
import { Avatar, avatarVariants } from "../../avatar/components/avatar";
import { reatomComponent } from "@reatom/npm-react";
import { createLink, Link } from "@/shared/components/config/link";
import { Typography } from "@repo/ui/typography";
import { atom } from "@reatom/framework";
import { isClientAtom } from "@/shared/models/global.model";
import { playerSeemsLikeAction } from "../models/player-seems-like.model";

const playerSeemsLikePlayersCountAtom = atom((ctx) => ctx.spy(playerSeemsLikeAction.dataAtom)?.meta.count ?? 0, "playerLandsCount")

const PlayerSeemsLikePlayersCount = reatomComponent(({ ctx }) => {
  const data = ctx.spy(playerSeemsLikePlayersCountAtom)

  return (
    <div className="w-8 flex items-center justify-center bg-neutral-800 h-8 rounded-full p-0.5">
      <span className="font-semibold text-lg">
        {data}
      </span>
    </div>
  )
}, "PlayerSeemsLikePlayersCount")

export const PlayerSeemsLikePlayers = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex items-center gap-2">
        <h4 className="text-white font-semibold text-2xl">Похожие игроки</h4>
        <PlayerSeemsLikePlayersCount />
      </div>
      <PlayerSeemsLikePlayersList />
    </div>
  )
}, "PlayerSeemsLikePlayers")

const seemsLikeGridVariant = tv({
  base: `grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 w-full h-full`,
  slots: {
    card: `flex flex-col rounded-lg p-2 overflow-hidden border border-neutral-900`,
    cardText: "text-base sm:text-lg font-semibold text-neutral-50 truncate text-center",
    cardAvatar: `w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-neutral-800`
  }
})

const PlayerSeemsLikePlayersListSkeleton = () => {
  return (
    <div className={seemsLikeGridVariant().base()}>
      {Array.from({ length: 16 }).map((item, idx) => (
        <div key={idx} className={seemsLikeGridVariant().card()}>
          <div className={seemsLikeGridVariant().cardAvatar()}>
            <Skeleton className={avatarVariants()} />
          </div>
          <div className="p-1">
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

const PlayerSeemsLikePlayersList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(playerSeemsLikeAction.dataAtom)?.data;

  if (ctx.spy(playerSeemsLikeAction.statusesAtom).isPending) {
    return <PlayerSeemsLikePlayersListSkeleton />
  }

  if (!data) return null;

  return (
    <div className={seemsLikeGridVariant().base()}>
      {data.map((player) => (
        <div
          key={player.uuid}
          className={seemsLikeGridVariant().card()}
        >
          <Link href={createLink("player", player.nickname)} className={seemsLikeGridVariant().cardAvatar()}>
            <Avatar nickname={player.nickname} />
          </Link>
          <Link href={createLink("player", player.nickname)} className="pt-1">
            <Typography className={seemsLikeGridVariant().cardText()}>
              {player.nickname}
            </Typography>
          </Link>
        </div>
      ))}
    </div>
  )
}, "PlayerSeemsLikePlayersList")