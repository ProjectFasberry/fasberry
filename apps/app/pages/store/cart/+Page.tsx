import { StoreSelectCurrency } from "@/shared/components/app/shop/components/store-footer";
import { SelectedDonate } from "@/shared/components/app/shop/components/store-donates";
import { SelectedWallet } from "@/shared/components/app/shop/components/store-wallets";
import { StorePrice } from "@/shared/components/app/shop/components/store-price";
import { createPaymentAction, paymentResult, paymentResultType, priceByCurrencyAction, storeCurrencyAtom, storeItem, storeTargetNickname } from "@/shared/components/app/shop/models/store.model";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { atom } from "@reatom/core";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { IconArrowLeft } from "@tabler/icons-react";
import EndCrystal from "@repo/assets/images/minecraft/end_crystal.webp"
import Belkoin from "@repo/assets/images/minecraft/belkoin_wallet.png"
import Elytra from "@repo/assets/images/minecraft/elytra.webp"
import ExpActive from "@repo/assets/images/minecraft/exp-active.webp"
import { z } from "zod/v4"
import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@repo/ui/dialog';
import FutureChicken from "@repo/assets/images/minecraft/future_chicken_mini.png"
import DiamondLoading from "@repo/assets/gifs/DiamondCoalloading2.gif"
import { ShopAreaItem } from "@/shared/components/app/shop/components/store";
import { StoreFinishedPreview } from "@/shared/components/app/shop/components/store-preview";
import { StoreItemForm } from "@/shared/components/app/shop/components/store-item-form";

const StartPayment = reatomComponent<{ trigger: ReactNode }>(({ ctx, trigger }) => {
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
    <Dialog open={open} onOpenChange={v => handleClose(v)}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:min-w-[640px] bg-neutral-950 h-auto overflow-y-auto border-none gap-0">
        {isCreatePaymentError && (
          <ShopAreaItem image={FutureChicken}>
            <Typography className="text-xl">
              Произошла ошибка при создании заказа :/
            </Typography>
            <Typography className="text-neutral-300 text-lg">
              Повторите попытку позже
            </Typography>
          </ShopAreaItem>
        )}
        {isCreatePaymentProccessing && (
          <ShopAreaItem image={DiamondLoading}>
            <Typography className="text-xl">
              Платеж уже выполняется...
            </Typography>
          </ShopAreaItem>
        )}
        {(!isCreatePaymentSuccess && !isCreatePaymentProccessing && !isCreatePaymentError) && (
          <div className="flex flex-col w-full gap-4">
            <StoreFinishedPreview />
            <StoreItemForm />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}, "StartPayment")

const UpdatePrice = reatomComponent(({ ctx }) => {
  const currency = ctx.spy(storeCurrencyAtom)

  const updatePrice = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await priceByCurrencyAction(ctx, currency)
  }

  return (
    <Button
      disabled={currency === 'RUB'}
      onClick={updatePrice}
      className="btn rounded-lg bg-neutral-800 hover:bg-neutral-700"
    >
      <Typography color="white" className="text-[14px] lg:text-[16px]">
        Обновить цену
      </Typography>
    </Button>
  )
}, "UpdatePrice")

const ShopPreFooter = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row justify-between w-full lg:items-center gap-2">
        <Typography color="white" className="text-base">
          Метод оплаты
        </Typography>
        <div className="flex items-center gap-2 w-fit">
          <StoreSelectCurrency />
          <UpdatePrice />
        </div>
      </div>
    </div>
  )
}
const nicknameSchema = z.string()
  .min(3, "Минимум 3 символа")
  .max(16, "Максимум 16 символов")
  .regex(/^[a-zA-Z0-9_]+$/, "Только латинские буквы, цифры и подчёркивание");

const isValidAtom = atom<boolean>((ctx) => {
  const shopItemState = ctx.spy(storeItem)
  const nickname = ctx.spy(storeTargetNickname)

  const isValid = (shopItemState.type !== null) && (shopItemState.value !== null)

  return isValid && nicknameSchema.safeParse(nickname).success
})


const ShopStart = reatomComponent(({ ctx }) => {
  return (
    <StartPayment
      trigger={
        <Button
          disabled={!ctx.spy(isValidAtom)} className="hover:bg-[#05b458] bg-[#088d47]"
        >
          <Typography color="white" className="text-lg">Приобрести</Typography>
        </Button>
      }
    />
  )
}, "ShopStart")

const ShopFooter = () => {
  return (
    <div
      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 justify-center w-fit rounded-lg">
        <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
          <img src={ExpActive} loading="lazy" width={36} height={36} alt="" />
        </div>
        <div className="flex flex-col">
          <Typography color="gray" className="text-base">Стоимость</Typography>
          <StorePrice />
        </div>
      </div>
      <div className="flex items-center w-fit">
        <ShopStart />
      </div>
    </div>
  )
}

const Basket = reatomComponent(({ ctx }) => {
  const type = ctx.spy(storeItem).type

  return (
    <div className="flex flex-col gap-4 bg-neutral-900 border-none rounded-lg">
      {type === 'donate' && <SelectedDonate />}
      {(type === 'belkoin' || type === 'charism') && <SelectedWallet />}
      <ShopPreFooter />
      <ShopFooter />
    </div>
  )
}, "Basket")

export default function StoreCard() {
  return (
    <MainWrapperPage>
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="flex items-center gap-2">
          <Button onClick={() => window.history.back()} className="px-2 gap-2 bg-neutral-800">
            <IconArrowLeft size={24} className='text-neutral-400'/>
            <Typography className="text-base font-semibold">
              Вернуться
            </Typography>
          </Button>
          <Typography className="text-3xl font-semibold">
            Корзина
          </Typography>
        </div>
        <Basket />
      </div>
    </MainWrapperPage>
  )
}