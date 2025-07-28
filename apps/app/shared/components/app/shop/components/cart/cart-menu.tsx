import { AtomState } from "@reatom/core"
import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { IconBasket, IconX } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@repo/ui/dropdown-menu"
import { Link } from "../../../../config/link"
import { Button } from "@repo/ui/button"
import { cartMenuIsOpenAtom, cartDataAtom, removeItemFromCart } from "../../models/store-cart.model"
import { StorePrice } from "./store-price"
import { ItemPrice } from "../items/store-list"

const CartMenuItem = reatomComponent<AtomState<typeof cartDataAtom>[number]>(({
  ctx, id, title, price, imageUrl, currency
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
        <ItemPrice currency={currency} price={price}/>
        <IconX
          onClick={() => removeItemFromCart(ctx, id)}
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

export const CartMenu = reatomComponent(({ ctx }) => {
  return (
    <DropdownMenu
      open={ctx.spy(cartMenuIsOpenAtom)}
      onOpenChange={v => cartMenuIsOpenAtom(ctx, v)}
    >
      <DropdownMenuTrigger asChild>
        <Link
          href="/store/cart"
          className="flex items-center h-10 justify-center bg-white/10 p-2 rounded-lg"
        >
          <IconBasket size={26} className="text-neutral-400" />
        </Link>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="flex flex-col min-w-80 sm:w-96 max-w-96 gap-4 p-4">
        <CartMenuData />
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col w-fit">
            <Typography className="text-base">
              Итого:
            </Typography>
            <StorePrice />
          </div>
          <Link href="/store/cart" onClick={() => cartMenuIsOpenAtom(ctx, false)}>
            <Button className="bg-green-700 hover:bg-green-800">
              <Typography className="font-semibold">
                В корзину
              </Typography>
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}, "CartMenu")