import { AtomState } from "@reatom/core"
import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { IconBasket, IconX } from "@tabler/icons-react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@repo/ui/hover-card"
import { Link } from "../../../../config/link"
import { Button } from "@repo/ui/button"
import { cartMenuIsOpenAtom, cartPriceAtom, cartDataAtom } from "../../models/store-cart.model"

const CartMenuItem = reatomComponent<AtomState<typeof cartDataAtom>[number]>(({ 
  ctx, id, title, price, imageUrl
}) => {
  return (
    <div className="flex items-center justify-between gap-2 bg-neutral-800 p-2 rounded-lg w-full">
      <div className="flex items-center gap-1 sm:gap-2">
        <img src={imageUrl} width={36} height={36} alt={title} loading="lazy" />
        <Typography className='font-semibold truncate text-lg'>
          {title}
        </Typography>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Typography className="text-lg text-nowrap font-semibold">
          {price} RUB
        </Typography>
        <IconX
          onClick={() => cartDataAtom.removeItem(ctx, id as number)}
          size={24}
          className="cursor-pointer hover:text-neutral-500 text-neutral-400"
        />
      </div>
    </div>
  )
}, "MenuCartItem")

const CartMenuData = reatomComponent(({ ctx }) => {
  const data = ctx.spy(cartDataAtom).slice(0, 3)

  return (
    <div className="flex flex-col w-full">
      <Typography className="font-semibold">
        Основные товары
      </Typography>
      <div className="flex flex-col gap-1 w-full">
        {data.length >= 1 ? (
          data.map((item, idx) => (
            <CartMenuItem key={idx} {...item} />
          ))
        ) : (
          <Typography color="gray">Пусто</Typography>
        )}
      </div>
    </div>
  )
}, "MenuCartData")

const CartMenuPrice = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col w-fit">
      <Typography className="text-base">
        Итого:
      </Typography>
      <Typography className='text-lg font-semibold'>
        {ctx.spy(cartPriceAtom)} RUB
      </Typography>
    </div>
  )
}, "MenuCartPrice")

export const CartMenu = reatomComponent(({ ctx }) => {
  return (
    <HoverCard
      open={ctx.spy(cartMenuIsOpenAtom)}
      onOpenChange={v => cartMenuIsOpenAtom(ctx, v)}
      openDelay={1}
      closeDelay={1}
    >
      <HoverCardTrigger asChild>
        <Link
          href="/store/cart"
          className="flex items-center justify-center bg-white/10 p-2 rounded-lg"
        >
          <IconBasket size={26} className="text-neutral-400" />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent side="left" className="flex flex-col min-w-80 sm:w-96 max-w-96 gap-4 p-4">
        <CartMenuData />
        <div className="flex justify-between items-center w-full">
          <CartMenuPrice />
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
}, "CartMenu")