import { RatingBelkoinCard, RatingBelkoinCardProps, RatingCharismCard, RatingCharismCardProps, RatingLandsCard, RatingLandsCardProps, RatingParkourCard, RatingParkourCardProps, RatingPlaytimeCard, RatingPlaytimeCardProps, RatingReputationCard, RatingReputationCardProps } from "./rating-cards";
import { ratingAction, ratingDataAtom, ratingMetaAtom } from "../models/ratings.model"
import Events from '@repo/assets/gifs/minecraft-boime.gif'
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { reatomComponent } from "@reatom/npm-react";
import { onConnect } from "@reatom/framework";
import { ratingFilterAtom } from "../models/rating-filter.model";
import { updateRatingAction } from "../models/update-ratings.model";
import { Skeleton } from "@repo/ui/skeleton";

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
    <div className="flex flex-col gap-y-2 w-full">
      <div className="grid grid-cols-[0.1fr_2.9fr_1fr_1fr] w-full gap-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-16" />
      </div>
      <hr />
      <RatingsListSkeleton />
    </div>
  )
}

const RatingIsEmpty = () => {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <img src={Events} alt="" width={256} height={256} />
      <p className="text-xl font-bold text-shark-50">
        Рейтингов пока нет
      </p>
    </div>
  )
}

const RatingListParkourHeader = () => {
  return (
    <div className="grid grid-cols-[0.1fr_2.9fr_1fr_1fr] w-full px-4">
      <p className="text-lg text-neutral-400">
        #
      </p>
      <p className="text-lg text-neutral-400">
        Игрок
      </p>
      <p className="text-lg text-neutral-400">
        Карта
      </p>
      <p className="text-lg text-neutral-400">
        Счет
      </p>
    </div>
  )
}

const RatingListCharismHeader = () => {
  return (
    <div className="grid grid-cols-[0.1fr_2.9fr_1fr_1fr] w-full px-4">
      <p className="text-lg text-neutral-400">
        #
      </p>
      <p className="text-lg text-neutral-400">
        Игрок
      </p>
      <p className="text-lg text-neutral-400">
        Харизмы
      </p>
    </div>
  )
}

const RatingListBelkoinHeader = () => {
  return (
    <div className="grid grid-cols-[0.1fr_2.9fr_1fr_1fr] w-full px-4">
      <p className="text-lg text-neutral-400" >
        #
      </p>
      <p className="text-lg text-neutral-400" >
        Игрок
      </p>
      <p className="text-lg text-neutral-400">
        Белкоинов
      </p>
    </div>
  )
}

const RatingListReputationHeader = () => {
  return (
    <div className="grid grid-cols-[0.1fr_2.9fr_1fr_1fr] w-full px-4">
      <p className="text-lg text-neutral-400" >
        #
      </p>
      <p className="text-lg text-neutral-400">
        Игрок
      </p>
      <p className="text-lg text-neutral-400">
        Репутация
      </p>
    </div>
  )
}

const RatingListPlaytimeHeader = () => {
  return (
    <div className="grid grid-cols-[0.1fr_2.9fr_1fr_1fr] w-full px-4">
      <p className="text-lg text-neutral-400">
        #
      </p>
      <p className="text-lg text-neutral-400">
        Игрок
      </p>
      <p className="text-lg text-neutral-400">
        Суммарное время
      </p>
    </div>
  )
}

const RatingListLandsHeader = () => {
  return (
    <div className="grid grid-cols-[0.1fr_2.9fr_1fr_1fr] w-full px-4">
      <p className="text-lg text-neutral-400" >
        #
      </p>
      <p className="text-lg text-neutral-400">
        Территория
      </p>
      <p className="text-lg text-neutral-400">
        Кол-во чанков
      </p>
      <p className="text-lg text-neutral-400" >
        Тип
      </p>
    </div>
  )
}

onConnect(ratingDataAtom, (ctx) => ratingAction(ctx, { type: "playtime", ascending: String(false) }))

export const RatingList = reatomComponent(({ ctx }) => {
  const ratingData = ctx.spy(ratingDataAtom)
  const ratingMeta = ctx.spy(ratingMetaAtom)
  const currentType = ctx.spy(ratingFilterAtom).type
  const { inView, ref } = useInView({ triggerOnce: false, threshold: 1 });

  const hasMore = ratingMeta?.hasNextPage;
  const isLoadingUpdated = ctx.spy(updateRatingAction.statusesAtom).isPending;

  useEffect(() => {
    if (inView && hasMore) updateRatingAction(ctx, "update-cursor");
  }, [inView, hasMore]);

  if (ctx.spy(ratingAction.statusesAtom).isPending) return <RatingsSkeleton />

  if (ctx.spy(ratingAction.statusesAtom).isRejected) return <RatingIsEmpty />;

  if (!ratingData) return (
    <span>Пока ничего нет :/</span>
  )

  return (
    <div className="flex flex-col gap-y-2 w-full">
      {isLoadingUpdated && <RatingsSkeleton />}
      {!isLoadingUpdated && (
        <>
          {currentType === 'parkour' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListParkourHeader />
              <hr />
              {(ratingData as RatingParkourCardProps[]).map((item, idx) => (
                <RatingParkourCard
                  key={idx}
                  idx={idx}
                  area={item.area}
                  gamesplayed={item.gamesplayed}
                  name={item.name}
                  player={item.player}
                  score={item.score}
                />
              ))}
            </div>
          )}
          {currentType === 'belkoin' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListBelkoinHeader />
              <hr />
              {(ratingData as RatingBelkoinCardProps[]).map((item, idx) => (
                <RatingBelkoinCard key={idx} idx={idx} points={item.points} username={item.username} />
              ))}
            </div>
          )}
          {currentType === 'reputation' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListReputationHeader />
              <hr />
              {(ratingData as RatingReputationCardProps[]).map((item, idx) => (
                <RatingReputationCard key={idx} idx={idx} reputation={item.reputation} uuid={item.uuid} nickname={item.nickname} />
              ))}
            </div>
          )}
          {currentType === 'charism' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListCharismHeader />
              <hr />
              {(ratingData as RatingCharismCardProps[]).map((item, idx) => (
                <RatingCharismCard key={idx} idx={idx} Balance={item.Balance} username={item.username} />
              ))}
            </div>
          )}
          {currentType === 'playtime' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListPlaytimeHeader />
              <hr />
              {(ratingData as RatingPlaytimeCardProps[]).map((item, idx) => (
                <RatingPlaytimeCard key={idx} idx={idx} TotalPlayTime={item.TotalPlayTime} username={item.username} />
              ))}
            </div>
          )}
          {currentType === 'lands_chunks' && (
            <div className="flex flex-col gap-2 w-full h-full">
              <RatingListLandsHeader />
              <hr />
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
      {hasMore && <div ref={ref} className="h-[1px] w-full" />}
    </div>
  )
}, "RatingList")