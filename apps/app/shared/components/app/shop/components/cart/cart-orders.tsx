import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { storeOrdersListAction, storeOrdersStatusAtom, storeOrdersTypeAtom } from "../../models/store-cart.model"
import { Link } from "@/shared/components/config/link"
import { Button } from "@repo/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu"

const CartOrdersSkeleton = () => {
  return (
    <div className='flex flex-col gap-2 w-full h-full'>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

const STATUSES: Record<string, string> = {
  "pending": "Ждёт оплаты",
  "succeeded": "Завершён"
}

const CartOrdersEmpty = () => {
  return (
    <div className="flex gap-2 *:w-fit flex-col w-full bg-neutral-900 sm:p-3 lg:p-4 rounded-lg" >
      <Typography className='text-2xl font-semibold'>
        Пусто
      </Typography>
      <Typography color="gray">
        Заказ появится сразу после оформления
      </Typography>
      <Link href="/store/cart">
        <Button className="bg-neutral-800 font-semibold">
          В корзину
        </Button>
      </Link>
    </div>
  )
}

const CartOrdersFilterStatus = reatomComponent(({ ctx }) => {
  const current = ctx.spy(storeOrdersStatusAtom)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-neutral-800 py-1">
          Статус
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col">
          <DropdownMenuItem data-state={current === 'all' ? "active" : "inactive"} className="group" onClick={() => storeOrdersStatusAtom(ctx, "all")}>
            <Typography className="group-data-[state=active]:text-green-600 group-data-[state=inactive]:text-neutral-50">
              Все
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem data-state={current === 'pending' ? "active" : "inactive"} className="group" onClick={() => storeOrdersStatusAtom(ctx, "pending")}>
            <Typography className="group-data-[state=active]:text-green-600 group-data-[state=inactive]:text-neutral-50">
              В ожидании
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem data-state={current === 'succeeded' ? "active" : "inactive"} className="group" onClick={() => storeOrdersStatusAtom(ctx, "succeeded")}>
            <Typography className="group-data-[state=active]:text-green-600 group-data-[state=inactive]:text-neutral-50">
              Завершенные
            </Typography>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

const CartOrdersFilterType = reatomComponent(({ ctx }) => {
  const current = ctx.spy(storeOrdersTypeAtom)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-neutral-800 py-1">
          Тип
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col">
          <DropdownMenuItem data-state={current === 'all' ? "active" : "inactive"} className="group" onClick={() => storeOrdersTypeAtom(ctx, "all")}>
            <Typography className="group-data-[state=active]:text-green-600 group-data-[state=inactive]:text-neutral-50">
              Все
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem data-state={current === 'game' ? "active" : "inactive"} className="group" onClick={() => storeOrdersTypeAtom(ctx, "game")}>
            <Typography className="group-data-[state=active]:text-green-600 group-data-[state=inactive]:text-neutral-50">
              Игровые
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem data-state={current === 'default' ? "active" : "inactive"} className="group" onClick={() => storeOrdersTypeAtom(ctx, "default")}>
            <Typography className="group-data-[state=active]:text-green-600 group-data-[state=inactive]:text-neutral-50">
              Пополнение
            </Typography>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

const CartOrdersFilter = () => {
  return (
    <div className="flex items-center gap-2 w-full">
      <CartOrdersFilterStatus />
      <CartOrdersFilterType />
    </div>
  )
}

const CartOrdersList = reatomComponent(({ ctx }) => {
  useUpdate(storeOrdersListAction, [])

  if (ctx.spy(storeOrdersListAction.statusesAtom).isPending) {
    return <CartOrdersSkeleton />
  }

  const data = ctx.spy(storeOrdersListAction.dataAtom)
  if (!data) return <CartOrdersEmpty />

  return (
    <div className='flex flex-col gap-2 w-full h-full'>
      {data.map((order) => (
        <div key={order.unique_id} className="flex items-center justify-between w-full p-4 rounded-lg bg-neutral-800">
          <div className="flex items-center gap-4">
            <Typography className="font-semibold text-lg">
              Заказ #{order.unique_id}
            </Typography>
            <Typography color="gray">
              {STATUSES[order.status]}
            </Typography>
          </div>
          <Link href={`/store/order/${order.unique_id}?type=${order.type}`}>
            <Button className="bg-neutral-50 text-neutral-950 font-semibold">
              Перейти к заказу
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}, "CartOrders")

export const CartOrders = () => {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <Typography className="text-3xl font-semibold">
        Заказы
      </Typography>
      <div className="flex flex-col gap-4 h-full w-full">
        <CartOrdersFilter />
        <CartOrdersList />
      </div>
    </div>
  )
}