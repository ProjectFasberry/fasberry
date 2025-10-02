import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog";
import { Typography } from "@repo/ui/typography";
import { currentUserAtom } from "@/shared/models/current-user.model";
import { isIdentityAtom } from "../models/player.model";
import { reatomAsync, withDataAtom } from "@reatom/async";
import { getOrders } from "../../shop/models/store-cart.model";
import { onConnect } from "@reatom/framework";
import { useState } from "react";

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

const ordersHistory = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => getOrders({ type: "all" }, { signal: ctx.controller.signal }))
}).pipe(withDataAtom())

const PurchasesList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ordersHistory.dataAtom)

  if (data && data.length === 0) {
    return <Typography color="gray">пусто</Typography>
  }

  if (!data) return null;

  return (
    data.map((order) => (
      <div key={order.id}>
        <span>{order.unique_id}</span>
      </div>
    ))
  )
}, "PurchasesList")

const PurchasesHistory = () => {
  const [open, setOpen] = useState(false);

  useUpdate((ctx) => open && ordersHistory(ctx), [open])

  return (
    <div className="flex items-center justify-between w-full">
      <Typography color="white" className="text-2xl font-semibold">
        Покупки
      </Typography>
      <Dialog open={open} onOpenChange={v => setOpen(v)}>
        <DialogTrigger asChild>
          <Button className="bg-neutral-50 w-fit">
            <Typography className="text-neutral-950 font-semibold">
              Открыть
            </Typography>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Активность покупок</DialogTitle>
          <PurchasesList />
        </DialogContent>
      </Dialog>
    </div>
  )
}

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