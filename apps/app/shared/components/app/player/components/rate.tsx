import { reatomComponent } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { IconHeart } from "@tabler/icons-react"
import { tv } from "tailwind-variants"
import { rateUser } from "../models/rate.model"
import { isIdentityAtom } from "../models/player.model"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@repo/ui/hover-card"
import { reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { client } from "@/shared/api/client"
import { Typography } from "@repo/ui/typography"
import { createLink, Link } from "@/shared/components/config/link"
import { onConnect } from "@reatom/framework"
import { currentUserAtom } from "@/shared/models/current-user.model"
import { Avatar } from "../../avatar/components/avatar"
import dayjs from "@/shared/lib/create-dayjs"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog"
import { Skeleton } from "@repo/ui/skeleton"

const likeButtonVariants = tv({
  base: `flex border-2 group rounded-full duration-150 *:duration-150 items-center gap-2`,
  variants: {
    variant: {
      inactive: "border-neutral-700",
      active: "border-red-600/90 bg-red-500/70 backdrop-blur-md",
      filled: "bg-neutral-50 active:scale-100"
    }
  },
  defaultVariants: {
    variant: "inactive"
  }
})

const rateButtonChildVariants = tv({
  base: `text-lg`,
  variants: {
    variant: {
      default: "",
      rated: `group-data-[state=rated]:fill-neutral-50 group-data-[state=rated]:text-neutral-50`,
      filled: `group-data-[state=filled]:text-neutral-900 group-data-[state=filled]:fill-neutral-900`,
    }
  }
})

type RateProps = {
  isRated: boolean,
  nickname: string,
  count: number
}

type RateList = {
  data: {
    initiator: string;
    created_at: string;
  }[];
  meta: number;
}

const rateList = reatomResource(async (ctx) => {
  const isIdentity = ctx.spy(isIdentityAtom);
  if (!isIdentity) return;

  const currentUser = ctx.get(currentUserAtom)
  if (!currentUser) return;

  return await ctx.schedule(async () => {
    const res = await client(`rates/${currentUser.nickname}`, {
      signal: ctx.controller.signal, throwHttpErrors: false
    })

    const data = await res.json<RateList | { error: string }>()

    if ("error" in data) return null;

    return data;
  })
}, "rateList").pipe(withStatusesAtom(), withDataAtom(), withCache())

onConnect(rateList.dataAtom, rateList)

const List = reatomComponent(({ ctx }) => {
  const data = ctx.spy(rateList.dataAtom)?.data
  if (!data) return null;

  return (
    <div className="flex flex-col overflow-y-auto max-h-[400px] gap-2 w-full h-full">
      {data.map(item => (
        <div key={item.initiator} className="flex items-center gap-2 bg-neutral-800 rounded-lg p-2">
          <Link href={createLink("player", item.initiator)}>
            <Avatar
              nickname={item.initiator}
              propWidth={32}
              propHeight={32}
              className="min-h-[32px] min-w-[32px]"
            />
          </Link>
          <div className="flex flex-col">
            <Link href={createLink("player", item.initiator)}>
              <Typography className="text-base font-semibold">
                {item.initiator}
              </Typography>
            </Link>
            <Typography color="gray" className="text-sm leading-3">
              {dayjs(item.created_at).fromNow()}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  )
}, "List")

const RateList = reatomComponent<Pick<RateProps, "count">>(({ ctx, count }) => {
  if (ctx.spy(rateList.statusesAtom).isPending && !ctx.spy(rateList.cacheAtom)) {
    return <Skeleton className="h-36 w-full" />
  }

  return (
    <>
      <div className="hidden sm:block">
        <HoverCard closeDelay={1} openDelay={1}>
          <HoverCardTrigger asChild>
            <Button
              data-state="filled"
              disabled={ctx.spy(rateUser.statusesAtom).isPending}
              className={likeButtonVariants({ variant: "filled" })}
            >
              <IconHeart className={rateButtonChildVariants({ variant: "filled" })} />
              <span className={rateButtonChildVariants({ variant: "filled" })}>
                {count}
              </span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <List />
          </HoverCardContent>
        </HoverCard >
      </div>
      <div className="block sm:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              data-state="filled"
              disabled={ctx.spy(rateUser.statusesAtom).isPending}
              className={likeButtonVariants({ variant: "filled" })}
            >
              <IconHeart className={rateButtonChildVariants({ variant: "filled" })} />
              <span className={rateButtonChildVariants({ variant: "filled" })}>
                {count}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Игроки, оценившие вас</DialogTitle>
            <List />
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}, "RateList")

export const Rate = reatomComponent<RateProps>(({
  ctx, isRated, nickname, count
}) => {
  const isIdentity = ctx.spy(isIdentityAtom);

  if (isIdentity) return <RateList count={count} />

  const parentVariant = isRated ? "active" : "inactive"
  const childVariant = isRated ? "rated" : "default"

  return (
    <Button
      data-state={isRated ? "rated" : "unrated"}
      disabled={ctx.spy(rateUser.statusesAtom).isPending}
      onClick={() => rateUser(ctx, nickname)}
      className={likeButtonVariants({ variant: parentVariant })}
    >
      <IconHeart className={rateButtonChildVariants({ variant: childVariant })} />
      <span className={rateButtonChildVariants({ variant: childVariant })}>
        {count}
      </span>
    </Button>
  )
}, "Rate")