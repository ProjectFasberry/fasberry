import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { storeOrdersListAction } from "../../models/store-cart.model"
import { Link } from "@/shared/components/config/link"
import { Button } from "@repo/ui/button"
import { sectionVariant } from "./cart-content"

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
    <div className={sectionVariant({ className: "flex gap-2 *:w-fit flex-col w-full" })}>
      <Typography className='text-2xl font-semibold'>
        Пусто
      </Typography>
      <Typography color="gray">
        Заказ появится сразу после оформления
      </Typography>
      <Link href="/store">
        <Button className="bg-neutral-800 font-semibold">
          В магазин
        </Button>
      </Link>
    </div>
  )
}

export const CartOrders = reatomComponent(({ ctx }) => {
  useUpdate(storeOrdersListAction, [])

  if (ctx.spy(storeOrdersListAction.statusesAtom).isPending) {
    return <CartOrdersSkeleton />
  }

  const data = ctx.spy(storeOrdersListAction.dataAtom)

  if (!data) return <CartOrdersEmpty/>

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
          <Link href={`/store/order/${order.unique_id}`}>
            <Button className="bg-neutral-50 text-neutral-950 font-semibold">
              Перейти к заказу
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}, "CartOrders")
