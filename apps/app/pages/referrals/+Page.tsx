import { Avatar } from "@/shared/components/app/avatar/components/avatar"
import { createLink, Link } from "@/shared/components/config/link"
import { client } from "@/shared/lib/client-wrapper"
import { currentUserAtom } from "@/shared/models/current-user.model"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { toast } from "sonner"

type Referral = {
  id: number;
  completed: boolean;
  created_at: Date;
  referral: string;
}

const referralsListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<Referral[]>("server/referrals/list").exec()
  )
}).pipe(withDataAtom(), withCache({ swr: false }), withStatusesAtom())

const ReferralsLink = reatomComponent(({ ctx }) => {
  const nickname = ctx.get(currentUserAtom)?.nickname;

  const handle = async () => {
    const link = `https://app.fasberry.su/auth?type=register&referrer=${nickname}`
    toast.success("Ссылка скопирована");
    await navigator.clipboard.writeText(link)
  }

  return (
    <div className="self-end w-full">
      <Button onClick={handle} className="bg-neutral-800">
        <Typography>
          Пригласить игрока
        </Typography>
      </Button>
    </div>
  )
}, "ReferralsLink")

const ReferralsListSkeleton = () => {
  return (
    <div className="flex flex-wrap auto-rows-auto gap-4 w-full h-fit">
      <Skeleton className="flex-1 h-22 w-full" />
      <Skeleton className="flex-1 h-22 w-full" />
      <Skeleton className="flex-1 h-22 w-full" />
    </div>
  )
}

const ReferralsList = reatomComponent(({ ctx }) => {
  useUpdate(referralsListAction, [])

  const data = ctx.spy(referralsListAction.dataAtom)

  if (ctx.spy(referralsListAction.statusesAtom).isPending) {
    return <ReferralsListSkeleton />
  }

  if (!data) return <span>пусто</span>

  return (
    <div className="flex flex-wrap gap-4 w-full h-fit">
      {data.map(({ referral, completed, id }) => (
        <div
          key={id}
          className="flex flex-col flex-1 p-4 h-22 gap-2 border border-neutral-800 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Link href={createLink("player", referral)}>
              <Avatar
                nickname={referral}
                propWidth={24}
                propHeight={24}
              />
            </Link>
            <Link href={createLink("player", referral)}>
              <Typography>
                {referral}
              </Typography>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Typography>
              Статус:
            </Typography>
            <Typography
              data-state={completed}
              className="data-[state=true]:text-green-500 data-[state=false]:text-neutral-400"
            >
              {completed ? "завершен" : "в процессе"}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  )
}, "ReferralsList")

export default function Page() {
  return (
    <div className="flex flex-col gap-4 w-full min-h-dvh h-full">
      <Typography className="text-2xl font-semibold">
        Ваши рефералы
      </Typography>
      <ReferralsList />
      <ReferralsLink />
    </div>
  )
}