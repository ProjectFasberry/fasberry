import { Skeleton } from "@repo/ui/skeleton";
import { tv } from "tailwind-variants";
import { Avatar, avatarVariants } from "../../avatar/components/avatar";
import { reatomComponent } from "@reatom/npm-react";
import { createLink, Link } from "@/shared/components/config/link";
import { Typography } from "@repo/ui/typography";
import { atom, onConnect } from "@reatom/framework";
import { isClientAtom } from "@/shared/models/page-context.model";
import { playerSeemsLikeAction, playerSeemsLikePlayersIsShowAtom, toggleShowAction } from "../models/player-seems-like.model";
import { IconX } from "@tabler/icons-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@repo/ui/tooltip"

const playerSeemsLikePlayersCountAtom = atom((ctx) => ctx.spy(playerSeemsLikeAction.dataAtom)?.meta.count ?? 0, "playerLandsCount")

const PlayerSeemsLikeShowToggle = reatomComponent(({ ctx }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={1}>
        <TooltipTrigger
          id="hide-section-seems-like"
          aria-label="Не показывать секцию"
          onClick={() => toggleShowAction(ctx)}
          className="cursor-pointer"
        >
          <IconX size={22} className="text-neutral-400" />
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-neutral-400 text-md">
            Не показывать
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}, "PlayerSeemsLikeShowToggle")

onConnect(playerSeemsLikeAction.dataAtom, playerSeemsLikeAction)

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
  const isShow = ctx.spy(playerSeemsLikePlayersIsShowAtom);
  if (!isShow) return null;

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-semibold text-2xl">Похожие игроки</h4>
          <PlayerSeemsLikePlayersCount />
        </div>
        <PlayerSeemsLikeShowToggle />
      </div>
      <PlayerSeemsLikePlayersList />
    </div>
  )
}, "PlayerSeemsLikePlayers")

const seemsLikeGridVariant = tv({
  base: `grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 w-full h-full`,
  slots: {
    card: `flex flex-col rounded-lg overflow-hidden`,
    cardText: "text-base sm:text-lg font-semibold text-neutral-50 truncate text-center",
    cardAvatar: `w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-neutral-800`
  }
})

const PlayerSeemsLikePlayersListSkeleton = () => {
  return (
    <div className={seemsLikeGridVariant().base()}>
      {Array.from({ length: 6 }).map((item, idx) => (
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
  if (!ctx.spy(isClientAtom)) {
    return <PlayerSeemsLikePlayersListSkeleton />
  }

  const data = ctx.spy(playerSeemsLikeAction.dataAtom)?.data;

  if (ctx.spy(playerSeemsLikeAction.statusesAtom).isPending) {
    return <PlayerSeemsLikePlayersListSkeleton />
  }

  if (!data) return null;

  return (
    <div className={seemsLikeGridVariant().base()}>
      {data.map(({ nickname, uuid }) => (
        <div
          key={uuid}
          className={seemsLikeGridVariant().card()}
        >
          <Link
            href={createLink("player", nickname)}
            aria-label={`Профиль игрока ${nickname}`}
            className={seemsLikeGridVariant().cardAvatar()}
          >
            <Avatar nickname={nickname} />
          </Link>
          <Link
            href={createLink("player", nickname)}
            aria-label={`Профиль игрока $${nickname}`}
            className="pt-1"
          >
            <Typography className={seemsLikeGridVariant().cardText()}>
              {nickname}
            </Typography>
          </Link>
        </div>
      ))}
    </div>
  )
}, "PlayerSeemsLikePlayersList")