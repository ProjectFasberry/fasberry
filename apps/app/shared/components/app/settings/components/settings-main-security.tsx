import { AlertDialog } from "@/shared/components/config/alert-dialog"
import { isEmptyArray } from "@/shared/lib/array"
import { client } from "@/shared/lib/client-wrapper"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog"
import { Typography } from "@repo/ui/typography"
import { SettingsSection } from "./ui"
import { NotFound } from "@/shared/ui/not-found"

const DeleteAccount = reatomComponent(({ ctx }) => {
  return (
    <>
      <AlertDialog />
      <Button
        disabled={true}
        className="w-fit self-start bg-red-600/80"
        onClick={() => { }}
      >
        <Typography className="leading-5 font-semibold">
          Удалить аккаунт
        </Typography>
      </Button>
    </>
  )
}, "DeleteAccount")

const accountSessionsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<unknown[]>("auth/sessions").exec()
  )
}, "accountSessionsAction").pipe(
  withDataAtom(null, (_, data) => isEmptyArray(data) ? null : data),
  withStatusesAtom(),
  withCache({ swr: false })
)

const AccountSessionsList = reatomComponent(({ ctx }) => {
  useUpdate(accountSessionsAction, []);

  const data = ctx.spy(accountSessionsAction.dataAtom);
  if (!data) return <NotFound title="пусто" />

  return (
    <div className="flex flex-col gap-2 w-full">
      {data.map((session, idx) => (
        <div key={idx}>
          {idx}
        </div>
      ))}
    </div>
  )
}, "AccountSessionsList")

const AccountSessions = reatomComponent(({ ctx }) => {
  return <AccountSessionsList />
}, "AccountSessions")

const ChangePassword = reatomComponent(({ ctx }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button background="white" className="w-fit">
          <Typography className="leading-5 font-semibold">
            Изменить пароль
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-center text-xl">Изменение пароля</DialogTitle>
        <Typography>

        </Typography>
      </DialogContent>
    </Dialog>
  )
}, "ChangePassword")

const SECTIONS = [
  {
    title: "Сессии",
    subtitle: "Активные сессии вашего аккаунта",
    component: <AccountSessions />
  },
  {
    title: "Пароль и аутенфикация",
    subtitle: "Изменение пароля от аккаунта",
    component: <ChangePassword />
  },
  {
    title: "Удаление аккаунта",
    subtitle: "Удаление затронет в том числе игровые данные, привязанные к этому аккаунту",
    component: <DeleteAccount />
  },
]

export const SettingsMainSecurity = () => {
  return (
    <div className="flex flex-col gap-8 w-full h-full">
      {SECTIONS.map((section, idx) => (
        <SettingsSection key={idx} {...section} />
      ))}
    </div>
  )
}