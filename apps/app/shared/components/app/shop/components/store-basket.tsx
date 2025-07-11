import { AtomState } from "@reatom/core"
import { reatomComponent } from "@reatom/npm-react"
import { basketIsOpen, basketPriceAtom, storeBasketDataAtom } from "../models/store.model"
import { Typography } from "@repo/ui/typography"
import { IconBasket, IconX } from "@tabler/icons-react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@repo/ui/hover-card"
import { Link } from "../../../config/Link"
import { Button } from "@repo/ui/button"

const BasketItem = reatomComponent<AtomState<typeof storeBasketDataAtom>[number]>(({ ctx, id, title, price, img }) => {
  return (
    <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-lg w-full">
      <div className="flex items-center gap-2">
        <img src={img} width={36} height={36} alt={title} loading="lazy" />
        <Typography className='font-semibold text-lg'>
          {title}
        </Typography>
      </div>
      <div className="flex items-center gap-1">
        <Typography className="text-lg font-semibold">
          {price} RUB
        </Typography>
        <IconX
          onClick={() => storeBasketDataAtom.removeItem(ctx, id)}
          size={22}
          className="hover:text-neutral-600 text-neutral-400"
        />
      </div>
    </div>
  )
}, "BasketItem")

const BasketData = reatomComponent(({ ctx }) => {
  const basketData = ctx.spy(storeBasketDataAtom).slice(0, 3)

  return (
    <div className="flex flex-col w-full">
      <Typography className="font-semibold">
        Основные товары
      </Typography>
      <div className="flex flex-col gap-1 w-full">
        {basketData.length >= 1 ? (
          basketData.map((item, idx) => (
            <BasketItem key={idx} {...item} />
          ))
        ) : (
          <Typography color="gray">Пусто</Typography>
        )}
      </div>
    </div>
  )
}, "BasketData")

const BasketPrice = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col w-fit">
      <Typography className="text-base">
        Итого:
      </Typography>
      <Typography className='text-lg font-semibold'>
        {ctx.spy(basketPriceAtom)} RUB
      </Typography>
    </div>
  )
}, "BasketPrice")

export const BasketTrigger = reatomComponent(({ ctx }) => {
  return (
    <HoverCard
      open={ctx.spy(basketIsOpen)}
      onOpenChange={v => basketIsOpen(ctx, v)}
      openDelay={1}
      closeDelay={1}
    >
      <HoverCardTrigger>
        <Link
          href="/store/cart"
          className="flex items-center justify-center bg-white/10 p-2 rounded-lg"
        >
          <IconBasket size={26} className="text-neutral-400" />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent side="left" className="flex flex-col w-96 gap-4 p-4">
        <BasketData />
        <div className="flex justify-between items-center w-full">
          <BasketPrice />
          <Link href="/store/cart">
            <Button className="bg-green-700 hover:bg-green-800">
              <Typography className="font-semibold">
                В корзину
              </Typography>
            </Button>
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}, "BasketTrigger")