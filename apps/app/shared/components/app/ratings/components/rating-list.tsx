import { RatingBelkoinCard, RatingCharismCard, RatingLandsCard, RatingParkourCard, RatingPlaytimeCard, RatingReputationCard } from "./rating-cards";
import { 
  RatingBelkoin,
  RatingCharism,
  RatingLands,
  RatingParkour, 
  RatingPlaytime, 
  RatingReputation
} from "@repo/shared/types/entities/rating"
import { useInView } from "react-intersection-observer";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { updateRatingAction } from "../models/update-ratings.model";
import { Skeleton } from "@repo/ui/skeleton";
import { tv } from "tailwind-variants";
import { ReactNode } from "react";
import { AtomState } from "@reatom/core";
import { ratingByAtom, ratingDataAtom, ratingMetaAtom } from "../models/ratings.model";

const RatingsSkeleton = () => {
  return (
    <>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </>
  )
}

const ratingHeader = tv({
  base: `grid w-full px-2 gap-2 lg:gap-0`,
  variants: {
    variant: {
      playtime: "grid-cols-[0.2fr_2.8fr_1fr]",
      charism: "grid-cols-[0.2fr_2.8fr_1fr]",
      belkoin: "grid-cols-[0.2fr_2.8fr_1fr]",
      parkour: "grid-cols-[0.2fr_2.8fr_1fr_1fr]",
      lands_chunks: "grid-cols-[0.2fr_2.8fr_1fr_1fr]",
      reputation: "grid-cols-[0.2fr_2.8fr_1fr]",
    }
  }
})

const ratingHeaderTypography = tv({
  base: "text-base sm:text-lg text-neutral-400 text-nowrap"
})

const RatingListParkourHeader = () => {
  return (
    <div className={ratingHeader({ variant: "parkour" })}>
      <p className={ratingHeaderTypography()}>#</p>
      <p className={ratingHeaderTypography()}>Игрок</p>
      <p className={ratingHeaderTypography()}>Карта</p>
      <p className={ratingHeaderTypography()}>Счет</p>
    </div>
  )
}

const RatingListCharismHeader = () => {
  return (
    <div className={ratingHeader({ variant: "charism" })}>
      <p className={ratingHeaderTypography()}>#</p>
      <p className={ratingHeaderTypography()}>Игрок</p>
      <p className={ratingHeaderTypography()}>Харизмы</p>
    </div>
  )
}

const RatingListBelkoinHeader = () => {
  return (
    <div className={ratingHeader({ variant: "belkoin" })}>
      <p className={ratingHeaderTypography()}>#</p>
      <p className={ratingHeaderTypography()}>Игрок</p>
      <p className={ratingHeaderTypography()}>Белкоинов</p>
    </div>
  )
}

const RatingListReputationHeader = () => {
  return (
    <div className={ratingHeader({ variant: "reputation" })}>
      <p className={ratingHeaderTypography()} >#</p>
      <p className={ratingHeaderTypography()}>Игрок</p>
      <p className={ratingHeaderTypography()}>Репутация</p>
    </div>
  )
}

const RatingListPlaytimeHeader = () => {
  return (
    <div className={ratingHeader({ variant: "playtime" })}>
      <p className={ratingHeaderTypography()}>#</p>
      <p className={ratingHeaderTypography()}>Игрок</p>
      <p className={ratingHeaderTypography()}>Суммарное время</p>
    </div>
  )
}

const RatingListLandsHeader = () => {
  return (
    <div className={ratingHeader({ variant: "lands_chunks" })}>
      <p className={ratingHeaderTypography()}>#</p>
      <p className={ratingHeaderTypography()}>Территория</p>
      <p className={ratingHeaderTypography()}>Кол-во чанков</p>
      <p className={ratingHeaderTypography()}>Тип</p>
    </div>
  )
}

const SyncViewer = ({ inView }: { inView: boolean }) => {
  useUpdate((ctx) => {
    if (!inView) return

    const hasMore = ctx.get(ratingMetaAtom)?.hasNextPage

    if (hasMore) {
      const target = ctx.get(ratingByAtom);
      
      updateRatingAction(ctx, target, "update-cursor")
    }
  }, [inView])

  return null;
}

const RatingsViewer = reatomComponent(({ ctx }) => {
  const { inView, ref } = useInView({ triggerOnce: false, threshold: 1 });

  return (
    <>
      <SyncViewer inView={inView} />
      <div ref={ref} className="h-[1px] border-transparent w-full" />
    </>
  )
}, "RatingsViewer")

const RatingsParkour = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingParkour[]
  if (!data) return null

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <RatingListParkourHeader />
      {data.map((item, idx) => (
        <RatingParkourCard
          key={idx}
          idx={idx}
          area={item.area}
          gamesplayed={item.gamesplayed}
          nickname={item.nickname}
          player={item.player}
          score={item.score}
        />
      ))}
    </div>
  )
}, "RatingParkour")

const RatingsBelkoin = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingBelkoin[]
  if (!data) return null

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <RatingListBelkoinHeader />
      {data.map((item, idx) => (
        <RatingBelkoinCard
          key={idx}
          idx={idx}
          balance={item.balance}
          nickname={item.nickname}
        />
      ))}
    </div>
  )
}, "RatingBelkoin")

const RatingsReputation = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingReputation[]
  if (!data) return null

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <RatingListReputationHeader />
      {data.map((item, idx) => (
        <RatingReputationCard
          key={idx}
          idx={idx}
          reputation={item.reputation}
          uuid={item.uuid}
          nickname={item.nickname}
        />
      ))}
    </div>
  )
}, "RatingReputation")

const RatingsCharism = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingCharism[]
  if (!data) return null

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <RatingListReputationHeader />
      {data.map((item, idx) => (
        <RatingCharismCard
          key={idx}
          idx={idx}
          balance={item.balance}
          nickname={item.nickname}
        />
      ))}
    </div>
  )
}, "RatingCharism")

const RatingsPlaytime = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingPlaytime[]
  if (!data) return null

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <RatingListPlaytimeHeader />
      {data.map((item, idx) => (
        <RatingPlaytimeCard
          key={idx}
          idx={idx}
          total={item.total}
          nickname={item.nickname}
        />
      ))}
    </div>
  )
}, "RatingPlaytime")

const RatingsLands = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingLands[]
  if (!data) return null

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <RatingListLandsHeader />
      {data.map((item, idx) => (
        <RatingLandsCard
          key={idx}
          idx={idx}
          type={item.type}
          blocks={item.blocks}
          chunks_amount={item.chunks_amount}
          land={item.land}
          members={item.members}
          name={item.name}
        />
      ))}
    </div>
  )
}, "RatingLands")

const COMPONENTS: Record<AtomState<typeof ratingByAtom>, ReactNode> = {
  "parkour": <RatingsParkour />,
  "lands_chunks": <RatingsLands />,
  "playtime": <RatingsPlaytime />,
  "belkoin": <RatingsBelkoin />,
  "reputation": <RatingsReputation />,
  "charism": <RatingsCharism />
}

const RatingsList = reatomComponent(({ ctx }) => {
  const by = ctx.spy(ratingByAtom)
  const updateIsLoading = ctx.spy(updateRatingAction.statusesAtom).isPending;

  return (
    <div className="flex flex-col gap-2 h-full w-full">
      {COMPONENTS[by]}
      {updateIsLoading && <RatingsSkeleton />}
    </div>
  )
}, "RatingsList")

export const Ratings = () => {
  return (
    <div className="flex flex-col h-fit w-full">
      <RatingsList />
      <RatingsViewer />
    </div>
  )
}