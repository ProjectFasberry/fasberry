import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog";
import { Typography } from "@repo/ui/typography";
import { reatomAsync, withDataAtom } from "@reatom/async";
import { getOrders } from "../../shop/models/store-cart.model";
import { useState } from "react";
import { isEmptyArray } from "@/shared/lib/array";
import { NotFound } from "@/shared/ui/not-found";

export const ChangePassword = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex flex-col min-w-0">
        <Typography color="white" className="text-2xl font-semibold">
          Пароль
        </Typography>
        <Typography color="gray" className="truncate">
          Изменение пароля от аккаунта
        </Typography>
      </div>
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
}).pipe(withDataAtom(null))

const PurchasesList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(ordersHistory.dataAtom)

  const isEmpty = isEmptyArray(data)

  if (isEmpty) {
    return <NotFound title="Пусто" />
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

export const PurchasesHistory = () => {
  const [open, setOpen] = useState(false);

  useUpdate((ctx) => open && ordersHistory(ctx), [open])

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex flex-col min-w-0">
        <Typography color="white" className="text-2xl font-semibold">
          Покупки
        </Typography>
        <Typography color="gray" className="truncate">
          Здесь отображена история ваших покупок
        </Typography>
      </div>
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