import { ReactNode, useState } from 'react';
import Totem from '@repo/assets/gifs/totem-of-undying-faked-death.gif';
import Heart from '@repo/assets/gifs/hardcore-heart-minecraft.gif';
import { SubscriptionItemForm } from './subscription-item-form';
import { reatomComponent } from '@reatom/npm-react';
import { Dialog } from '@ark-ui/react';
import { ShopAreaItem } from './shop-area';
import { Typography } from '@/shared/ui/typography';
import { ShopFinishedPreview } from './shop-preview';
import { createPaymentAction, paymentResult, paymentResultType } from './store.model';

export const StartPayment = reatomComponent<{ trigger: ReactNode }>(({ ctx, trigger }) => {
  const [open, setOpen] = useState(false)
  const type = ctx.spy(paymentResultType)

  const handleClose = (v: boolean) => {
    if (!v) {
      setOpen(false)

      if (type === 'error') {
        return paymentResult.reset(ctx)
      }
    } else {
      setOpen(true)
    }
  }

  const isCreatePaymentSuccess = type === 'created'
  const isCreatePaymentError = type === 'error'
  const isCreatePaymentProccessing = ctx.spy(createPaymentAction.statusesAtom).isPending

  return (
    <Dialog.Root open={open} onOpenChange={e => handleClose(e.open)}>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Content className="!w-[640px] h-auto overflow-y-auto border-none gap-0">
        {isCreatePaymentError && (
          <ShopAreaItem image={Heart}>
            <Typography className="text-xl">
              Произошла ошибка при создании заказа :/
            </Typography>
            <Typography className="text-neutral-300 text-lg">
              Повторите попытку позже
            </Typography>
          </ShopAreaItem>
        )}
        {isCreatePaymentProccessing && (
          <ShopAreaItem image={Totem}>
            <Typography className="text-xl">
              Платеж уже выполняется...
            </Typography>
          </ShopAreaItem>
        )}
        {(!isCreatePaymentSuccess && !isCreatePaymentProccessing && !isCreatePaymentError) && (
          <div className="flex flex-col w-full gap-4">
            <ShopFinishedPreview />
            <SubscriptionItemForm />
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}, "StartPayment")