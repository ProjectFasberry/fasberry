'use client';

import { Typography } from '@repo/landing-ui/src/typography';
import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@repo/landing-ui/src/dialog';
import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { ShopAreaItem } from '#components/shop/shop-area';
import { ShopFinishedPreview } from '#components/shop/shop-preview';
import { CREATE_PAYMENT_MUTATION_KEY, SubscriptionItemForm } from './subscription-item-form';
import Totem from '@repo/assets/gifs/totem-of-undying-faked-death.gif';
import Heart from '@repo/assets/gifs/hardcore-heart-minecraft.gif';
import { PAYMENT_STATUS_QUERY_KEY, paymentStatusQuery } from '#components/shop/shop-payment-status';

export const StartPayment = ({ trigger }: { trigger: ReactNode }) => {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data: paymentStatus } = paymentStatusQuery()

  const mutData = useMutationState({
    filters: ({ mutationKey: CREATE_PAYMENT_MUTATION_KEY }),
    select: m => m.state.status,
  });

  const handleClose = (v: boolean) => {
    if (!v) {
      setOpen(false)

      if (paymentStatus?.type === 'error') {
        return qc.resetQueries({ queryKey: PAYMENT_STATUS_QUERY_KEY })
      }
    } else {
      setOpen(true)
    }
  }

  const isCreatePaymentSuccess = paymentStatus?.type === 'created'
  const isCreatePaymentError = paymentStatus?.type === 'error'
  const isCreatePaymentProccessing = mutData[mutData.length - 1] === 'pending';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="!w-[640px] h-auto overflow-y-auto border-none gap-0">
        {isCreatePaymentError && (
          <ShopAreaItem image={Heart.src}>
            <Typography className="text-xl">
              Произошла ошибка при создании заказа :/
            </Typography>
            <Typography className="text-neutral-300 text-lg">
              Повторите попытку позже
            </Typography>
          </ShopAreaItem>
        )}
        {isCreatePaymentProccessing && (
          <ShopAreaItem image={Totem.src}>
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
      </DialogContent>
    </Dialog>
  )
}