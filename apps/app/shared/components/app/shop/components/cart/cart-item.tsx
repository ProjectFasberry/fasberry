import { reatomComponent } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { IconCheck, IconGift, IconTrash } from "@tabler/icons-react"
import { Typography } from "@repo/ui/typography"
import { createLink } from "@/shared/components/config/link"
import {
  removeItemFromCartAction,
  updateItemSelectedStatus
} from "../../models/store-item.model"
import {
  changeRecipientOpenDialogAction
} from "../../models/store-recipient.model"
import { CartPayload } from "@repo/shared/types/entities/store"
import { CURRENCIES } from "./cart-price"
import { cartDataItemIsSelectAtom } from "../../models/store-cart.model"

const CartItemRemoveFromCart = reatomComponent<{ id: number }>(({ ctx, id }) => {
  return (
    <Button
      title="Удалить"
      className="flex cursor-pointer items-center justify-center h-8 p-1 rounded-lg bg-neutral-700"
      onClick={() => removeItemFromCartAction(ctx, id)}
      disabled={ctx.spy(removeItemFromCartAction.statusesAtom).isPending}
    >
      <IconTrash size={22} />
    </Button>
  )
}, "CartItemRemoveFromCart")

const CartItemUpdateSelectStatus = reatomComponent<{ id: number }>(({ ctx, id }) => {
  const selected = ctx.spy(cartDataItemIsSelectAtom(id))

  return (
    <Button
      className="absolute top-3 left-3 flex items-center justify-center !p-0 w-6 h-6 bg-blue-600/80"
      onClick={() => updateItemSelectedStatus(ctx, id)}
      disabled={ctx.spy(updateItemSelectedStatus.statusesAtom).isPending}
    >
      {selected ? <IconCheck size={22} /> : null}
    </Button>
  )
}, "CartItemUpdateSelectStatus")

export const CartItem = reatomComponent<CartPayload["products"][number]>(({
  ctx, ...item
}) => {
  const { id, title, imageUrl, summary, recipient, price, currency } = item

  return (
    <div
      id={id.toString()}
      className="flex items-center w-full relative gap-2 max-h-[126px] overflow-hidden rounded-lg p-4 sm:p-6 bg-neutral-800"
    >
      <CartItemUpdateSelectStatus id={id} />
      <div className="flex items-center select-none min-w-[36px] min-h-[36px] h-[48px] w-[48px] justify-center overflow-hidden rounded-lg">
        <img src={imageUrl} draggable={false} width={48} height={48} alt="" className="min-h-[48px] min-w-[48px]" />
      </div>
      <div className="flex flex-col justify-center w-full gap-2">
        <a href={createLink("store", id.toString())} target="_blank" className="flex flex-col">
          <Typography color="white" className="text-md sm:text-base font-semibold truncate">
            {title}
          </Typography>
          <Typography color="gray" className="line-clamp-2 leading-tight text-sm sm:text-md w-full">
            {summary}
          </Typography>
        </a>
        <div className="flex items-center gap-2">
          <div
            title="Получатель"
            className="flex cursor-pointer items-center gap-1 h-8 justify-center bg-neutral-700 rounded-lg px-2 py-0.5"
            onClick={() => changeRecipientOpenDialogAction(ctx, item)}
          >
            <IconGift size={20} className="text-neutral-400" />
            <Typography className="text-nowrap text-truncate text-base">
              {`для ${recipient}`}
            </Typography>
          </div>
          <CartItemRemoveFromCart id={id} />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <Typography className="font-semibold text-nowrap">
            {price}
          </Typography>
          <img src={CURRENCIES[currency].img} alt={CURRENCIES[currency].symbol} className="w-5 h-5 inline-block" />
        </div>
      </div>
    </div>
  )
}, "CartItem")