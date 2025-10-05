import { Skeleton } from "@repo/ui/skeleton"
import { landsAction } from "../models/lands.model"
import { reatomComponent } from "@reatom/npm-react"
import { createLink, Link } from "@/shared/components/config/link"
import { tv } from 'tailwind-variants'
import { Typography } from '@repo/ui/typography'
import { useState } from "react"
import { FormattedText } from "../../land/components/land-title"
import { DefaultBanner } from "../../land/components/land-banner"
import { Avatar } from "../../avatar/components/avatar"
import { IconCircleFilled } from "@tabler/icons-react"
import { MasonryGrid } from "@repo/ui/masonry-grid"
import { Land } from "@repo/shared/types/entities/land"
import { onConnect } from "@reatom/framework"
import { isEmptyArray } from "@/shared/lib/array"
import { NotFound } from "@/shared/ui/not-found"

type LandCard = Pick<Land, "ulid" | "name" | "members" | "level" | "title" | "balance">

const landCardVariants = tv({
  base: `flex items-start justify-between gap-6 duration-150 relative w-full rounded-lg p-3 sm:p-4 lg:p-6 border 
    border-neutral-800 hover:bg-neutral-800`,
  slots: {
    child: "flex flex-col gap-3 overflow-hidden",
    stat: "inline-flex items-center gap-2 text-base"
  }
})

const LandCard = ({ level, members, name, title, ulid }: LandCard) => {
  return (
    <Link href={createLink("land", ulid)} className={landCardVariants().base()}>
      <div className={landCardVariants().child()}>
        <div className="flex items-center gap-2 w-full">
          <Avatar
            nickname={"distribate"}
            propWidth={26}
            propHeight={26}
            className="min-w-[26px] min-h-[26px]"
          />
          <Typography className="text-lg truncate">
            {"distribate"}
          </Typography>
        </div>
        <Typography className="text-xl truncate font-semibold">
          {name}
        </Typography>
        {title && <FormattedText text={title} />}
        <div className="flex flex-col select-none gap-1">
          <Typography className={landCardVariants().stat()}>
            <IconCircleFilled size={8} />
            {Object.keys(members).length} участников
          </Typography>
          <Typography className={landCardVariants().stat()}>
            <IconCircleFilled size={8} />
            {level} уровень
          </Typography>
        </div>
      </div>
      <DefaultBanner banner={null} variant="small" />
    </Link >
  )
}

const masonryOpts = {
  columnConfig: {
    default: 1,
    640: 2,
    1024: 3,
    1280: 3,
  },
  columnGap: 6,
  rowGap: 6
}

const SKELETON_HEIGHTS = ['h-32', 'h-44', 'h-36', 'h-40', 'h-56', 'h-64', 'h-72'];
const SKELETON_COUNT = 12;

const LandsSkeleton = () => {
  const [randomHeights] = useState(() =>
    Array.from({ length: SKELETON_COUNT }).map(() => {
      const randomIdx = Math.floor(Math.random() * SKELETON_HEIGHTS.length);
      return SKELETON_HEIGHTS[randomIdx];
    })
  );

  return (
    <MasonryGrid
      {...masonryOpts}
      items={randomHeights}
      renderItem={((height, idx) => <Skeleton key={idx} className={`${height} w-full`} />)}
    />
  )
}

onConnect(landsAction.dataAtom, landsAction)

export const LandsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(landsAction.dataAtom)

  if (ctx.spy(landsAction.statusesAtom).isPending) {
    return <LandsSkeleton />
  }

  if (!data) return null;

  const isEmpty = isEmptyArray(data?.data);

  if (isEmpty) {
    return <NotFound title="Пока ничего нет" />
  }

  return (
    <MasonryGrid
      items={data.data}
      renderItem={(land) => <LandCard key={land.ulid} {...land} />}
      {...masonryOpts}
    />
  )
}, "LandsList")