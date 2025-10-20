import { logout } from "@/shared/components/app/auth/models/auth.model"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import { action, atom } from "@reatom/core"
import { MainWrapperPage } from "@/shared/components/config/wrapper"
import dayjs from "@/shared/lib/create-dayjs"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { client } from "@/shared/lib/client-wrapper"
import { startPageEvents } from "@/shared/lib/events"
import { pageContextAtom } from "@/shared/models/page-context.model"

type Banned = {
  reason: string
  time: string
  created_at: string
}

const BannedActionButton = reatomComponent(({ ctx }) => {
  const isDisabled = ctx.spy(logout.statusesAtom).isPending || ctx.spy(logout.statusesAtom).isFulfilled;

  return (
    <Button
      onClick={() => logout(ctx)}
      disabled={isDisabled}
      className='bg-neutral-50 text-red-500 font-semibold text-lg'
    >
      Выйти из аккаунта
    </Button>
  );
}, "BannedActionButton")

const bannedAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<{ initiator: string, expires: Date, created_at: Date, reason: string | null, nickname: string }>("ban-status")
      .exec()
  )
}).pipe(withDataAtom(), withStatusesAtom(), withCache({ swr: false }))

const Banned = reatomComponent(({ ctx }) => {
  const data = ctx.spy(bannedAction.dataAtom)
  if (!data) return null;

  const expires = data.expires ? dayjs(data.expires).format('DD.MM.YYYY HH:mm') : "никогда"

  return (
    <div className="flex flex-col gap-y-4 justify-center h-full items-center relative">
      <Typography
        color="gray"
        className="text-md font-semibold"
      >
        Соединение потеряно
      </Typography>
      <div className="flex flex-col items-center gap-y-4">
        <Typography
          className="text-xl font-semibold text-red-500"
        >
          Вы были заблокированы
        </Typography>
        <div className="flex flex-col items-center">
          <Typography
            className="text-lg font-semibold text-red-500"
          >
            Причина: <span className="text-neutral-50">{data?.reason ?? "не указана"}</span>
          </Typography>
          <Typography
            className="text-lg font-semibold text-red-500"
          >
            Разбан:{' '}
            <span className="text-neutral-50">
              {expires}
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

const events = action((ctx) => {
  bannedAction(ctx)
})

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [pageContextAtom]);

  return (
    <MainWrapperPage>
      <div className="flex items-center h-[80vh] justify-center w-full">
        <Banned />
      </div>
    </MainWrapperPage>
  )
}