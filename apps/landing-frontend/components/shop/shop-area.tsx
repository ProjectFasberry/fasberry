import { useMutationState } from '@tanstack/react-query';
import { Typography } from '@repo/landing-ui/src/typography';
import { CREATE_PAYMENT_MUTATION_KEY, SubscriptionItemForm } from '#components/shop/subscription-item-form';
import Totem from '@repo/assets/gifs/totem-of-undying-faked-death.gif';
import Heart from '@repo/assets/gifs/hardcore-heart-minecraft.gif';
import { ReactNode } from 'react';
import { ShopFinishedPreview } from './shop-preview';
import { paymentStatusQuery } from './shop-payment-status';

type ShopAreaItemProps = {
  image: string,
  children: ReactNode
}

export const ShopAreaItem = ({
  children, image,
}: ShopAreaItemProps) => {
  return (
    <div className="flex items-center justify-center flex-col gap-4">
      <img src={image} width={142} height={142} alt="" draggable={false} />
      <div className="flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

export const ShopArea = () => {
  const { data: paymentStatus } = paymentStatusQuery()

  const mutData = useMutationState({
    filters: ({ mutationKey: CREATE_PAYMENT_MUTATION_KEY }),
    select: m => m.state.status,
  });

  const isCreatePaymentSuccess = paymentStatus?.type === 'created'
  const isCreatePaymentError = paymentStatus?.type === 'error'
  const isCreatePaymentProccessing = mutData[mutData.length - 1] === 'pending';

  return (
    <>
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
    </>
  );
};