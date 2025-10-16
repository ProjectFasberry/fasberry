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
import { Skeleton } from "@repo/ui/skeleton";
import { ReactNode } from "react";
import { AtomState } from "@reatom/core";
import { ratingAscAtom, ratingByAtom, ratingDataAtom, ratingIsViewAtom, updateRatingAction } from "../models/ratings.model";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { Avatar } from "../../avatar/components/avatar";
import { createLink, Link } from "@/shared/components/config/link";
import dayjs from "@/shared/lib/create-dayjs"

const RatingListParkourHeaderU = () => {
  return (
    <TableRow className="*:font-semibold *:text-base">
      <TableHead className="w-[64px]">#</TableHead>
      <TableHead>Игрок</TableHead>
      <TableHead>Карта</TableHead>
      <TableHead className="text-right">Счет</TableHead>
    </TableRow>
  )
}

const RatingListCharismHeaderU = () => {
  return (
    <TableRow className="*:font-semibold *:text-base">
      <TableHead className="w-[64px]">#</TableHead>
      <TableHead>Игрок</TableHead>
      <TableHead className="text-right">Харизмы</TableHead>
    </TableRow>
  )
}

const RatingListBelkoinHeaderU = () => {
  return (
    <TableRow className="*:font-semibold *:text-base">
      <TableHead className="w-[64px]">#</TableHead>
      <TableHead>Игрок</TableHead>
      <TableHead className="text-right">Белкоинов</TableHead>
    </TableRow>
  )
}

const TableRowsSkeleton = () => {
  return (
    <TableRow className="*:font-semibold *:text-base">
      <TableHead className="w-[64px]">
        <Skeleton className="h-8 w-8" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-10 w-24" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-10 w-full" />
      </TableHead>
    </TableRow>
  )
}

const RatingListReputationHeaderU = () => {
  return (
    <TableRow className="*:font-semibold *:text-base">
      <TableHead className="w-[64px]">#</TableHead>
      <TableHead>Игрок</TableHead>
      <TableHead className="text-right">Репутация</TableHead>
    </TableRow>
  )
}

const RatingListPlaytimeHeaderU = () => {
  return (
    <TableRow className="*:font-semibold *:text-base">
      <TableHead className="w-[64px]">#</TableHead>
      <TableHead>Игрок</TableHead>
      <TableHead className="text-right">Суммарное время</TableHead>
    </TableRow>
  )
}

const RatingListLandsHeaderU = () => {
  return (
    <TableRow className="*:font-semibold *:text-base">
      <TableHead className="w-[64px]">#</TableHead>
      <TableHead>Территория</TableHead>
      <TableHead>Чанков</TableHead>
      <TableHead className="text-right">Тип</TableHead>
    </TableRow>
  )
}

const RatingsViewer = () => {
  const { inView, ref } = useInView({ triggerOnce: false, threshold: 1 });
  useUpdate((ctx) => ratingIsViewAtom(ctx, inView), [inView]);
  return <div ref={ref} className="h-[1px] border-transparent w-full" />
}

const RatingTableBodyParkour = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingParkour[]
  if (!data) return null

  return (
    data.map((user, idx) => (
      <TableRow key={user.nickname}>
        <TableCell className="font-medium">{idx + 1}</TableCell>
        <TableCell>
          <UserHead nickname={user.nickname!} />
        </TableCell>
        <TableCell>{user.area}</TableCell>
        <TableHead className="text-right">{user.score}</TableHead>
      </TableRow>
    ))
  )
})

const RatingTableBodyBelkoin = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingBelkoin[]
  if (!data) return null

  return (
    data.map((user, idx) => (
      <TableRow key={user.nickname}>
        <TableCell className="font-medium">{idx + 1}</TableCell>
        <TableCell>
          <UserHead nickname={user.nickname} />
        </TableCell>
        <TableHead className="text-right">{formatNumber(user.points)}</TableHead>
      </TableRow>
    ))
  )
})

const RatingTableBodyReputation = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingReputation[]
  if (!data) return null

  return (
    data.map((user, idx) => (
      <TableRow key={user.nickname}>
        <TableCell className="font-medium">{idx + 1}</TableCell>
        <TableCell>
          <UserHead nickname={user.nickname} />
        </TableCell>
        <TableHead className="text-right">{user.reputation}</TableHead>
      </TableRow>
    ))
  )
})

function formatNumber(n: number) {
  return Number.isInteger(n) ? n : n.toFixed(2);
}

const RatingTableBodyCharism = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingCharism[]
  if (!data) return null

  return (
    data.map((user, idx) => (
      <TableRow key={user.nickname}>
        <TableCell className="font-medium">{idx + 1}</TableCell>
        <TableCell>
          <UserHead nickname={user.nickname} />
        </TableCell>
        <TableHead className="text-right">{formatNumber(user.balance)}</TableHead>
      </TableRow>
    ))
  )
})

const RatingTableBodyLands = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingLands[]
  if (!data) return null

  return (
    data.map((land, idx) => (
      <TableRow key={idx}>
        <TableCell className="font-medium">{idx + 1}</TableCell>
        <TableCell>{land.name}</TableCell>
        <TableCell>{land.chunks_amount}</TableCell>
        <TableHead className="text-right">{land.type}</TableHead>
      </TableRow>
    ))
  )
})

const RatingsFilter = reatomComponent(({ ctx }) => {
  const current = ctx.spy(ratingAscAtom);

  return (
    <Button
      className='bg-neutral-800 hover:bg-neutral-700 aspect-square text-neutral-400 h-8 w-8 p-1'
      onClick={() => ratingAscAtom(ctx, (state) => !state)}
    >
      {current ? <IconArrowDown /> : <IconArrowUp />}
    </Button>
  )
}, "RatingsFilter")

const RatingsHeader = () => {
  return (
    <div className="flex items-center justify-between w-full">
      <RatingsFilter />
    </div>
  )
}

const UserHead = ({ nickname }: {nickname: string}) => {
  return (
    <Link href={createLink("player", nickname)} className="flex items-center gap-2">
      <Avatar
        nickname={nickname}
        propWidth={26}
        propHeight={26}
      />
      {nickname}
    </Link>
  )
}

const RatingTableBodyPlaytime = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ratingDataAtom) as RatingPlaytime[]
  if (!data) return null

  return (
    data.map((user, idx) => (
      <TableRow key={user.nickname}>
        <TableCell className="font-medium">{idx + 1}</TableCell>
        <TableCell>
          <UserHead nickname={user.nickname}/>
        </TableCell>
        <TableHead className="text-right">
          {Math.floor(dayjs.duration(user.total ?? 0).asHours())} часа(-ов)
        </TableHead>
      </TableRow>
    ))
  )
}, "RatingTableBodyPlaytime")

const HEADERS: Record<AtomState<typeof ratingByAtom>, ReactNode> = {
  "lands_chunks": <RatingListLandsHeaderU />,
  "parkour": <RatingListParkourHeaderU />,
  "playtime": <RatingListPlaytimeHeaderU />,
  "belkoin": <RatingListBelkoinHeaderU />,
  "reputation": <RatingListReputationHeaderU />,
  "charism": <RatingListCharismHeaderU />
}

const COMPONENTS: Record<AtomState<typeof ratingByAtom>, ReactNode> = {
  "playtime": <RatingTableBodyPlaytime />,
  "lands_chunks": <RatingTableBodyLands />,
  "reputation": <RatingTableBodyReputation />,
  "charism": <RatingTableBodyCharism />,
  "belkoin": <RatingTableBodyBelkoin />,
  "parkour": <RatingTableBodyParkour />
}

const RatingTableHeader = reatomComponent(({ ctx }) => HEADERS[ctx.spy(ratingByAtom)], "RatingTableHeader")
const RatingTableBody = reatomComponent(({ ctx }) => {
  const updateIsLoading = ctx.spy(updateRatingAction.statusesAtom).isPending

  if (updateIsLoading) {
    return (
      Array.from({ length: 32 }).map((_, idx) => (
        <TableRowsSkeleton key={idx} />
      ))
    )
  }

  return COMPONENTS[ctx.spy(ratingByAtom)]
}, "RatingTableBody")

export const Ratings = () => {
  return (
    <Table>
      <TableCaption>Рейтинг</TableCaption>
      <TableHeader>
        <RatingTableHeader />
      </TableHeader>
      <TableBody>
        <RatingTableBody />
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
    </Table>
  )
}