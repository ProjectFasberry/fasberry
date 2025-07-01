import { RatingBelkoinCard, RatingCharismCard, RatingLandsCard, RatingParkourCard, RatingPlaytimeCard, RatingReputationCard } from "./rating-cards";
import { ratingAction, RatingBelkoin, RatingCharism, ratingDataAtom, ratingMetaAtom, RatingParkour, RatingPlaytime, RatingReputation } from "../models/ratings.model"
import Events from '@repo/assets/gifs/minecraft-boime.gif'
import { useInView } from "react-intersection-observer";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { ratingFilterAtom } from "../models/rating-filter.model";
import { updateRatingAction } from "../models/update-ratings.model";
import { Skeleton } from "@repo/ui/skeleton";
import { tv } from "tailwind-variants";

const RatingsListSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

const RatingsSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 h-fit w-full">
      <div className="flex flex-col gap-y-2 w-full">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}

const RatingIsEmpty = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <img src={Events} loading="lazy" alt="" width={256} height={256} />
      <p className="text-xl font-bold text-shark-50">Рейтингов пока нет</p>
    </div>
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
      updateRatingAction(ctx, "update-cursor")
    }
  }, [inView])

  return null;
}

const Viewer = reatomComponent(({ ctx }) => {
  const { inView, ref } = useInView({ triggerOnce: false, threshold: 1 });

  return (
    <>
      <SyncViewer inView={inView} />
      <div ref={ref} className="h-[1px] border-transparent w-full" />
    </>
  )
})

export const RatingList = reatomComponent(({ ctx }) => {
  const ratingData = ctx.spy(ratingDataAtom)
  const by = ctx.spy(ratingFilterAtom).by

  const isLoadingUpdated = ctx.spy(updateRatingAction.statusesAtom).isPending;

  if (ctx.spy(ratingAction.statusesAtom).isPending) {
    return <RatingsSkeleton />
  }

  if (ctx.spy(ratingAction.statusesAtom).isRejected || !ratingData) {
    return <RatingIsEmpty />;
  }

  return (
    <div className="flex flex-col gap-2 h-fit w-full">
      {isLoadingUpdated && <RatingsSkeleton />}
      {!isLoadingUpdated && (
        <>
          {by === 'parkour' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListParkourHeader />
              {(ratingData as RatingParkour[]).map((item, idx) => (
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
          )}
          {by === 'belkoin' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListBelkoinHeader />
              {(ratingData as RatingBelkoin[]).map((item, idx) => (
                <RatingBelkoinCard key={idx} idx={idx} points={item.points} nickname={item.nickname} />
              ))}
            </div>
          )}
          {by === 'reputation' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListReputationHeader />
              {(ratingData as RatingReputation[]).map((item, idx) => (
                <RatingReputationCard key={idx} idx={idx} reputation={item.reputation} uuid={item.uuid} nickname={item.nickname} />
              ))}
            </div>
          )}
          {by === 'charism' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListCharismHeader />
              {(ratingData as RatingCharism[]).map((item, idx) => (
                <RatingCharismCard key={idx} idx={idx} balance={item.balance} nickname={item.nickname} />
              ))}
            </div>
          )}
          {by === 'playtime' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListPlaytimeHeader />
              {(ratingData as RatingPlaytime[]).map((item, idx) => (
                <RatingPlaytimeCard key={idx} idx={idx} total={item.total} nickname={item.nickname} />
              ))}
            </div>
          )}
          {by === 'lands_chunks' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListLandsHeader />
              {/* @ts-ignore */}
              {(ratingData as RatingLandsCardProps[]).map((item, idx) => (
                <RatingLandsCard
                  type={item.type} blocks={item.blocks} key={idx} idx={idx} chunks_amount={item.chunks_amount}
                  land={item.land} members={item.members} name={item.name}
                />
              ))}
            </div>
          )}
        </>
      )}
      {isLoadingUpdated && <RatingsListSkeleton />}
      <Viewer />
    </div>
  )
}, "RatingList")