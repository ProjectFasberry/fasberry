import Totem from '@repo/assets/gifs/totem-of-undying-faked-death.gif';
import Heart from '@repo/assets/gifs/hardcore-heart-minecraft.gif';
import { ReactNode } from 'react';
import { ShopFinishedPreview } from './shop-preview';
import { Typography } from '@repo/ui/typography';
import { SubscriptionItemForm } from './subscription-item-form';
import { reatomComponent } from '@reatom/npm-react';
import { createPaymentAction, paymentResultType } from './store.model';

type ShopAreaItemProps = {
  image: string,
  children: ReactNode
}

export const ShopAreaItem = ({ children, image }: ShopAreaItemProps) => {
  return (
    <div className="flex items-center justify-center flex-col gap-4">
      <img src={image} width={142} height={142} alt="" draggable={false} />
      <div className="flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

export const ShopArea = reatomComponent(({ ctx }) => {
  const type = ctx.spy(paymentResultType)

  const isCreatePaymentSuccess = type === 'created'
  const isCreatePaymentError = type === 'error'
  const isCreatePaymentProccessing = ctx.spy(createPaymentAction.statusesAtom).isPending

  return (
    <>
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
    </>
  );
}, "ShopArea")