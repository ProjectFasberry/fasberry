import { Avatar } from "@/shared/components/app/avatar/components/avatar"
import { createLink, Link } from "@/shared/components/config/link"
import { APP_URL, LANDING_URL } from "@/shared/env"
import { client } from "@/shared/lib/client-wrapper"
import { getStaticImage } from "@/shared/lib/volume-helpers"
import { currentUserAtom } from "@/shared/models/current-user.model"
import { PageHeaderImage } from "@/shared/ui/header-image"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { IconBook, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"

type Referral = { id: number; completed: boolean; created_at: Date; referral: string }

const referralsListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<Referral[]>("server/referrals/list").exec()
  )
}, "referralsListAction").pipe(
  withDataAtom(null, (_, data) => data.length === 0 ? null : data),
  withCache({ swr: false }),
  withStatusesAtom()
)

const getReferralIp = (v: string) => `${APP_URL}/auth?type=register&referrer=${v}`

const ReferralsLink = reatomComponent(({ ctx }) => {
  const nickname = ctx.get(currentUserAtom)?.nickname;
  if (!nickname) return null;
  
  const handle = async () => {
    const link = getReferralIp(nickname)
    await navigator.clipboard.writeText(link)
    toast.success("Ссылка скопирована");
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 justify-start w-full">
      <Button
        background="white"
        className="gap-2 sm:w-fit w-full"
        onClick={handle}
      >
        <IconPlus size={20} />
        <Typography className="font-semibold truncate text-lg">
          Пригласить игрока
        </Typography>
      </Button>
      <a
        href={`${LANDING_URL}/wiki/referals`}
        target="_blank"
        className="flex min-w-0 sm:w-fit w-full"
      >
        <Button background="default" className="gap-2 flex-1 min-w-0 flex">
          <IconBook size={20} />
          <Typography className="text-lg truncate w-full min-w-0 font-semibold">
            Как работает реферальная система
          </Typography>
        </Button>
      </a>
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

  if (ctx.spy(referralsListAction.statusesAtom).isPending) {
    return <ReferralsListSkeleton />
  }

  const data = ctx.spy(referralsListAction.dataAtom)

  if (!data) return <span>пусто</span>

  return (
    <div className="flex flex-wrap gap-4 w-full h-fit">
      {data.map(({ referral, completed, id }) => (
        <div
          key={id}
          className="flex flex-col flex-1 min-w-0 p-4 h-22 gap-2 border border-neutral-800 rounded-lg"
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
          <div className="flex items-center gap-1 min-w-0">
            <Typography>
              Статус:
            </Typography>
            <Typography
              data-state={completed}
              className="data-[state=true]:text-green-500 truncate data-[state=false]:text-neutral-400"
            >
              {completed ? "завершен" : "в процессе"}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  )
}, "ReferralsList")

const referalsImage = getStaticImage("images/emotes-preview.webp")

export default function Page() {
  return (
    <div className="flex flex-col gap-6 w-full min-w-0 min-h-dvh h-full">
      <PageHeaderImage img={referalsImage} />
      <div className="flex flex-col gap-4 min-w-0 w-full h-full">
        <Typography className="text-3xl font-semibold">
          Ваши рефералы
        </Typography>
        <ReferralsList />
        <ReferralsLink />
      </div>
    </div>
  )
}