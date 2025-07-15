import { reatomComponent } from "@reatom/npm-react"
import { 
  changeRecipient, 
  changeRecipientDialogIsOpen, 
  changeRecipientIsValidAtom, 
  newRecipientAtom, 
  openRecipientChangeDialog, 
  removeFromCart, 
  selectCartItem, 
  StoreBasket 
} from "../../models/store-cart.model"
import { Button } from "@repo/ui/button"
import { IconCheck, IconGift, IconTrash } from "@tabler/icons-react"
import { Typography } from "@repo/ui/typography"
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog"
import { Input } from "@repo/ui/input"
import { createLink } from "@/shared/components/config/link"

const ChangeRecipient = reatomComponent<{ recipient: string, origin: string }>(({
  ctx, recipient, origin
}) => {
  const isDisabled = !ctx.spy(changeRecipientIsValidAtom)

  return (
    <Dialog
      open={ctx.spy(changeRecipientDialogIsOpen)}
      onOpenChange={v => changeRecipientDialogIsOpen(ctx, v)}
    >
      <DialogContent>
        <DialogTitle>Получатель товара</DialogTitle>
        <Typography>
          Для некоторых товаров доступен выбор получателя.
          Если получатель не выбран, то товар будет приобретен для вас
        </Typography>
        <div className="flex items-center w-full gap-2">
          <Input
            className='rounded-lg text-lg w-full'
            placeholder="Введите никнейм получателя"
            maxLength={32}
            value={ctx.spy(newRecipientAtom) ?? recipient}
            onChange={e => newRecipientAtom(ctx, e.target.value)}
          />
          <Button
            className="bg-neutral-50 text-neutral-950 font-semibold"
            disabled={isDisabled}
            onClick={() => changeRecipient(ctx, origin)}
          >
            Применить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "ChangeRecipient")

export const CartItem = reatomComponent<StoreBasket>(({
  ctx, title, img, description, details, origin, price, id
}) => {
  const recipient = details.for
  
  return (
    <div
      id={origin}
      className="flex items-center w-full relative gap-2 max-h-[126px] overflow-hidden rounded-lg p-4 sm:p-6 bg-neutral-800"
    >
      <Button
        className="absolute top-3 left-3 flex items-center justify-center !p-0 w-6 h-6 bg-blue-600/80"
        onClick={() => selectCartItem(ctx, origin)}
      >
        {details.selected ? <IconCheck size={22} /> : null}
      </Button>
      <div className="flex items-center select-none min-w-[36px] min-h-[36px] h-[48px] w-[48px] justify-center overflow-hidden rounded-lg">
        <img src={img} draggable={false} width={48} height={48} alt="" className="min-h-[48px] min-w-[48px]" />
      </div>
      <div className="flex flex-col justify-center w-full gap-2">
        <a href={createLink("store", origin)} target="_blank" className="flex flex-col">
          <Typography color="white" className="text-md sm:text-base font-semibold truncate">
            {title}
          </Typography>
          <Typography color="gray" className="line-clamp-2 leading-tight text-sm sm:text-md w-full">
            {description}
          </Typography>
        </a>
        <div className="flex items-center gap-2">
          {recipient && (
            <>
              <div
                title="Получатель"
                className="flex cursor-pointer items-center gap-2 h-8 justify-center bg-neutral-700 rounded-lg px-2 py-0.5"
                onClick={() => openRecipientChangeDialog(ctx, recipient)}
              >
                <IconGift size={20} />
                <Typography className="text-nowrap text-truncate text-base">
                  для {recipient}
                </Typography>
              </div>
              <ChangeRecipient recipient={recipient} origin={origin} />
            </>
          )}
          <div
            title="Удалить"
            className="flex cursor-pointer items-center justify-center h-8 p-1 rounded-lg bg-neutral-700"
            onClick={() => removeFromCart(ctx, origin)}
          >
            <IconTrash size={22} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Typography className="font-semibold text-nowrap">
          {price} RUB
        </Typography>
      </div>
    </div>
  )
}, "CartItem")