import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog";
import { Typography } from "@repo/ui/typography";
import { currentUserAtom } from "@/shared/models/current-user.model";
import { isIdentityAtom } from "../models/player.model";

const ChangePassword = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <Typography color="white" className="text-2xl font-semibold">
        Пароль
      </Typography>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-neutral-50 w-fit">
            <Typography className="text-neutral-950 font-semibold">
              Изменить
            </Typography>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Изменение пароля</DialogTitle>
          <Typography>

          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  )
}, "ChangePassword")

const PurchasesHistory = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <Typography color="white" className="text-2xl font-semibold">
        Покупки
      </Typography>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-neutral-50 w-fit">
            <Typography className="text-neutral-950 font-semibold">
              Открыть
            </Typography>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Активность покупок</DialogTitle>
          <Typography>

          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  )
}, "PurchasesHistory")

export const PlayerActivity = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return null;

  const isIdentity = ctx.spy(isIdentityAtom)

  if (!isIdentity) return null;

  return (
    <div className="flex flex-col gap-4 w-full h-fit">
      <PurchasesHistory />
      <ChangePassword />
    </div>
  )
}, "PlayerActivity")