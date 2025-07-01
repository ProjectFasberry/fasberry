import { reatomComponent } from "@reatom/npm-react";
import dayjs from "dayjs";
import { HTMLAttributes } from "react";
import { Link } from "@/shared/components/config/Link";
import { Avatar } from "@/shared/components/app/avatar/avatar";
import { tv, VariantProps } from "tailwind-variants";
import { currentUserAtom } from "@/shared/api/global.model";
import { RatingBelkoin, RatingCharism, RatingLands, RatingParkour, RatingPlaytime, RatingReputation } from "../models/ratings.model";
import relativeTime from "dayjs/plugin/relativeTime";
import localeData from "dayjs/plugin/localeData";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/ru";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Typography } from "@repo/ui/typography";
import { atom } from "@reatom/core";

dayjs.extend(relativeTime);
dayjs.extend(localeData);
dayjs.extend(duration);
dayjs.extend(localizedFormat);
dayjs.locale("ru");

const ratingCardVariants = tv({
  base: `grid select-none grid-rows-1 gap-2 w-full p-2 rounded-lg`,
  variants: {
    variant: {
      default: "bg-neutral-900",
      selected: "bg-gradient-to-r from-neutral-800 via-neutral-800 from-[5%] via-90% to-green-700",
    },
    type: {
      playtime: "grid-cols-[0.2fr_2.8fr_1fr]",
      charism: "grid-cols-[0.2fr_2.8fr_1fr]",
      belkoin: "grid-cols-[0.2fr_2.8fr_1fr]",
      parkour: "grid-cols-[0.2fr_2.8fr_1fr_1fr]",
      lands_chunks: "grid-cols-[0.2fr_2.8fr_1fr_1fr]",
      reputation: "grid-cols-[0.2fr_2.8fr_1fr]",
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

type RatingCardProps = HTMLAttributes<HTMLDivElement>
  & VariantProps<typeof ratingCardVariants>

const RatingCard = ({
  variant, className, type, ...props
}: RatingCardProps) => {
  return <div className={ratingCardVariants({ variant, type, className })} {...props} />
}

type RatingInitial = { idx: number }

const UserHead = ({ nickname }: { nickname: string }) => {
  return (
    <div className="flex items-center gap-2">
      <Link href={`/player/${nickname}`}>
        <Avatar
          nickname={nickname}
          propHeight={42}
          propWidth={42}
          className="h-[36px] w-[36px] max-h-[36px] max-w-[36px] sm:w-[36px] sm:h-[36px] sm:max-h-[42px] sm:max-w-[42px]"
        />
      </Link>
      <Link href={`/player/${nickname}`}>
        <p className="text-base sm:text-lg truncate">{nickname}</p>
      </Link>
    </div>
  )
}

const CardIndex = ({ idx }: { idx: number }) => {
  return (
    <div className="flex items-center justify-center">
      <Typography className="text-base sm:text-lg font-semibold">{idx + 1}</Typography>
    </div>
  )
}

const isOwnerAtom = (target: string) => atom((ctx) => {
  const currentUser = ctx.spy(currentUserAtom)
  return target === currentUser?.nickname
}, `isOwnerAtom`)

export const RatingLandsCard = reatomComponent<RatingLands & RatingInitial>(({
  ctx, land, chunks_amount, members, name, type, idx, blocks
}) => {
  const nickname = Object.keys(members)[0]
  const isOwner = ctx.spy(isOwnerAtom(nickname))

  return (
    <RatingCard variant={isOwner ? "selected" : "default"} type="lands_chunks">
      <CardIndex idx={idx} />
      <div className="flex items-center gap-2">
        <Link href={`/land/${land}`}>
          <Typography className="text-base sm:text-lg">
            {name}
          </Typography>
        </Link>
      </div>
      <div className="flex items-center justify-start relative">
        <Typography className="text-base sm:text-lg">
          {chunks_amount}
        </Typography>
      </div>
      <div className="flex items-center justify-start relative">
        <Typography className="text-base sm:text-lg">
          {type}
        </Typography>
      </div>
    </RatingCard>
  )
}, "RatingLandsCard")

export const RatingReputationCard = reatomComponent<RatingReputation & RatingInitial>(({
  nickname, reputation, uuid, idx, ctx
}) => {
  const isOwner = ctx.spy(isOwnerAtom(nickname))

  return (
    <RatingCard variant={isOwner ? "selected" : "default"} type="reputation">
      <CardIndex idx={idx} />
      <UserHead nickname={nickname} />
      <div className="flex items-center justify-start relative">
        <Typography className="text-base sm:text-lg">
          {reputation}
        </Typography>
      </div>
    </RatingCard>
  )
}, "RatingReputationCard")

export const RatingCharismCard = reatomComponent<RatingCharism & RatingInitial>(({
  balance, nickname, idx, ctx
}) => {
  const isOwner = ctx.spy(isOwnerAtom(nickname))
  
  return (
    <RatingCard variant={isOwner ? "selected" : "default"} type="charism">
      <CardIndex idx={idx} />
      <UserHead nickname={nickname} />
      <div className="flex items-center justify-start relative">
        <Typography className="text-base sm:text-lg">
          {Math.floor(balance ?? 0)}
        </Typography>
      </div>
    </RatingCard>
  )
}, "RatingCharismCard")

export const RatingBelkoinCard = reatomComponent<RatingBelkoin & RatingInitial>(({
  points, nickname, idx, ctx
}) => {
  const isOwner = ctx.spy(isOwnerAtom(nickname))

  return (
    <RatingCard variant={isOwner ? "selected" : "default"} type="belkoin">
      <CardIndex idx={idx} />
      <UserHead nickname={nickname} />
      <div className="flex items-center justify-start relative">
        <Typography className="text-base sm:text-lg">
          {Math.floor(points ?? 0)}
        </Typography>
      </div>
    </RatingCard>
  )
}, "RatingBelkoinCard")

export const RatingParkourCard = reatomComponent<RatingParkour & RatingInitial>(({
  gamesplayed, player, score, area, nickname, idx, ctx
}) => {
  const isOwner = ctx.spy(isOwnerAtom(nickname!))

  return (
    <RatingCard variant={isOwner ? "selected" : "default"} type="parkour">
      <CardIndex idx={idx} />
      <UserHead nickname={nickname!} />
      <div className="flex items-center justify-start">
        <Typography className="text-base sm:text-lg">
          {area}
        </Typography>
      </div>
      <div className="flex items-center justify-start">
        <Typography className="text-base sm:text-lg">
          {score}
        </Typography>
      </div>
    </RatingCard>
  )
}, "RatingParkourCard")

export const RatingPlaytimeCard = reatomComponent<RatingPlaytime & RatingInitial>(({
  total, nickname, idx, ctx
}) => {
  const isOwner = ctx.spy(isOwnerAtom(nickname))

  return (
    <RatingCard variant={isOwner ? "selected" : "default"} type="playtime">
      <CardIndex idx={idx} />
      <UserHead nickname={nickname} />
      <div className="flex items-center justify-start w-full relative">
        <Typography className="text-base sm:text-lg text-nowrap truncate">
          {Math.floor(dayjs.duration(total ?? 0).asHours())} часа(-ов)
        </Typography>
      </div>
    </RatingCard>
  )
}, "RatingPlaytimeCard")