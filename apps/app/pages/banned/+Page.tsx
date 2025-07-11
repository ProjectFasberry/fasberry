import { logout } from "@/shared/components/app/auth/models/auth.model"
import { reatomComponent } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import dayjs from "@/shared/lib/create-dayjs"
import { atom } from "@reatom/core"

type Banned = {
  reason: string
  time: string
  created_at: string
}

const bannedAtom = atom<Banned | null>(null, "banned")

const BannedActionButton = reatomComponent(({ ctx }) => {
  return (
    <Button
      disabled={ctx.spy(logout.statusesAtom).isPending || ctx.spy(logout.statusesAtom).isFulfilled}
      onClick={() => logout(ctx)}
    >
      Выйти из аккаунта
    </Button>
  );
}, "BannedActionButton")

const Banned = reatomComponent(({ ctx }) => {
  const data = ctx.spy(bannedAtom)

  return (
    <div className="flex flex-col gap-y-4 items-center relative">
      <Typography
        color="gray"
        className="text-md font-semibold"
      >
        Соединение потеряно
      </Typography>
      <div className="flex flex-col items-center gap-y-4">
        <Typography
          className="text-md font-semibold text-red-500"
        >
          Вы были заблокированы на форуме.
        </Typography>
        <div className="flex flex-col items-center">
          <Typography
            className="text-md font-semibold text-red-500"
          >
            Причина: <span className="text-shark-50">{data?.reason}</span>
          </Typography>
          <Typography
            className="text-md font-semibold text-red-500"
          >
            Разбан:{' '}
            <span className="text-shark-50">
              {dayjs(data?.time).format('DD.MM.YYYY HH:mm')}
            </span>
          </Typography>
        </div>
        <div className="w-full *:w-full">
          <BannedActionButton />
        </div>
      </div>
    </div>
  )
})

export function BannedRouteComponent() {
  return (
    <div className="flex w-full relative h-screen items-center justify-center">
      <Banned />
    </div>
  )
}