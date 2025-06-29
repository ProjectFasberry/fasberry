import { reatomComponent } from "@reatom/npm-react";
import dayjs from "dayjs";
import { HTMLAttributes } from "react";
import { Link } from "@/shared/components/config/Link";
import { Avatar } from "@/shared/components/app/avatar/avatar";
import { tv, VariantProps } from "tailwind-variants";
import { currentUserAtom } from "@/shared/api/global.model";

const ratingCardVariants = tv({
  base: `grid grid-cols-[0.1fr_2.9fr_1fr_1fr] select-none grid-rows-1 gap-2 w-full p-2 rounded-lg`,
  variants: {
    variant: {
      default: "bg-shark-950 hover:bg-shark-900",
      selected: "bg-gradient-to-r from-shark-800 via-shark-800 from-[5%] via-90% to-green-700",
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

type RatingCardProps = HTMLAttributes<HTMLDivElement>
  & VariantProps<typeof ratingCardVariants>

const RatingCard = ({
  variant, className, ...props
}: RatingCardProps) => {
  return (
    <div className={ratingCardVariants({ variant, className })} {...props} />
  )
}

type RatingInitial = {
  idx: number
}

export type RatingPlaytimeCardProps = RatingInitial & {
  TotalPlayTime: number | null;
  username: string | null;
}

export type RatingParkourCardProps = RatingInitial & {
  gamesplayed: number | null
  player: string | null,
  score: number | null;
  area: string | null;
  name: string | null;
}

export type RatingBelkoinCardProps = RatingInitial & {
  username: string | null;
  points: number | null;
}

export type RatingCharismCardProps = RatingInitial & {
  Balance: number | null;
  username: string | null;
}

export type RatingReputationCardProps = RatingInitial & {
  reputation: number;
  uuid: string | null;
  nickname: string | null;
}

export type RatingLandsCardProps = RatingInitial & {
  land: string;
  chunks_amount: number;
  members: {
    [key: string]: {
      chunks: number;
    }
  };
  name: string;
  type: string;
  blocks: any
}

export const RatingLandsCard = reatomComponent<RatingLandsCardProps>(({
  ctx, land, chunks_amount, members, name, type, idx, blocks
}) => {
  const currentUser = ctx.spy(currentUserAtom)

  const isOwner = currentUser?.nickname === Object.keys(members)[0]

  return (
    <RatingCard variant={isOwner ? "selected" : "default"}>
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold">
          {idx + 1}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/land/${land}`}>
          <p className="text-[18px]">
            {name}
          </p>
        </Link>
      </div>
      <div className="flex items-center justify-start relative -left-1">
        <p className="text-lg">
          {chunks_amount}
        </p>
      </div>
      <div className="flex items-center justify-start relative -left-1">
        <p className="text-lg">
          {type}
        </p>
      </div>
    </RatingCard>
  )
}, "RatingLandsCard")

export const RatingReputationCard = reatomComponent<RatingReputationCardProps>(({
  nickname, reputation, uuid, idx, ctx
}) => {
  const currentUser = ctx.spy(currentUserAtom)

  const isOwner = currentUser?.nickname === nickname

  return (
    <RatingCard variant={isOwner ? "selected" : "default"}>
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold">
          {idx + 1}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/player/${nickname}`}>
          <Avatar nickname={nickname || "a"} propHeight={42} propWidth={42} />
        </Link>
        <Link href={`/player/${nickname}`}>
          <p className="text-[18px] truncate">
            {nickname}
          </p>
        </Link>
      </div>
      <div className="flex items-center justify-start relative -left-1">
        <p className="text-lg">
          {reputation}
        </p>
      </div>
    </RatingCard>
  )
}, "RatingReputationCard")

export const RatingCharismCard = reatomComponent<RatingCharismCardProps>(({
  Balance, username: nickname, idx, ctx
}) => {
  const currentUser = ctx.spy(currentUserAtom)

  const isOwner = currentUser?.nickname === nickname

  return (
    <RatingCard variant={isOwner ? "selected" : "default"}>
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold">
          {idx + 1}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/player/${nickname}`}>
          <Avatar nickname={nickname || "a"} propHeight={42} propWidth={42} />
        </Link>
        <Link href={`/player/${nickname}`}>
          <p className="text-[18px] truncate">{nickname}</p>
        </Link>
      </div>
      <div className="flex items-center justify-start relative -left-1">
        <p className="text-lg">
          {Math.floor(Balance ?? 0)}
        </p>
      </div>
    </RatingCard>
  )
}, "RatingCharismCard")

export const RatingBelkoinCard = reatomComponent<RatingBelkoinCardProps>(({
  points, username: nickname, idx, ctx
}) => {
  const currentUser = ctx.spy(currentUserAtom)

  const isOwner = currentUser?.nickname === nickname

  return (
    <RatingCard variant={isOwner ? "selected" : "default"}>
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold">
          {idx + 1}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/player/${nickname}`}>
          <Avatar nickname={nickname!} propHeight={42} propWidth={42} />
        </Link>
        <Link href={`/player/${nickname}`}>
          <p className="text-[18px] truncate">{nickname}</p>
        </Link>
      </div>
      <div className="flex items-center justify-start relative -left-1">
        <p className="text-lg">
          {Math.floor(points ?? 0)}
        </p>
      </div>
    </RatingCard>
  )
}, "RatingBelkoinCard")

export const RatingParkourCard = reatomComponent<RatingParkourCardProps>(({
  gamesplayed, player, score, area, name: nickname, idx, ctx
}) => {
  const currentUser = ctx.spy(currentUserAtom)

  const isOwner = currentUser?.nickname === nickname

  return (
    <RatingCard variant={isOwner ? "selected" : "default"}>
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold">
          {idx + 1}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/player/${nickname}`}>
          <Avatar nickname={nickname || "a"} propHeight={42} propWidth={42} />
        </Link>
        <Link href={`/player/${nickname}`}>
          <p className="text-[18px] truncate">{nickname}</p>
        </Link>
      </div>
      <div className="flex items-center justify-start">
        <p className="text-lg">
          {area}
        </p>
      </div>
      <div className="flex items-center justify-start">
        <p className="text-lg">
          {score}
        </p>
      </div>
    </RatingCard>
  )
}, "RatingParkourCard")

export const RatingPlaytimeCard = reatomComponent<RatingPlaytimeCardProps>(({
  TotalPlayTime, username: nickname, idx, ctx
}) => {
  const currentUser = ctx.spy(currentUserAtom)

  const isOwner = currentUser?.nickname === nickname

  return (
    <RatingCard variant={isOwner ? "selected" : "default"}>
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold">
          {idx + 1}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/player/${nickname}`}>
          <Avatar nickname={nickname || "a"} propHeight={42} propWidth={42} />
        </Link>
        <Link href={`/player/${nickname}`}>
          <p className="text-[18px] truncate">{nickname}</p>
        </Link>
      </div>
      <div className="flex items-center justify-start relative -left-1">
        <p className="text-lg">
          {Math.floor(dayjs.duration(TotalPlayTime ?? 0).asHours())} часа(-ов)
        </p>
      </div>
    </RatingCard>
  )
}, "RatingPlaytimeCard")