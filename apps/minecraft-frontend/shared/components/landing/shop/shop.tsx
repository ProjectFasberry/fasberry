import { SelectedWallet, WalletsList } from "./shop-list-wallets"
import { EventsList } from "./shop-list-events"
import { ShopPaymentModal } from "./shop-payment-modal"
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import {
  paymentResultDialogIsOpen,
  paymentResultType,
  priceByCurrencyAction,
  StoreCategory,
  storeCategoryAtom,
  storeCurrencyAtom,
  storeItem,
  storeTargetNickname
} from "./store.model"
import { DonatesList, SelectedDonate } from "./shop-list-donates"
import EndCrystal from "@repo/assets/images/minecraft/end_crystal.webp"
import Belkoin from "@repo/assets/images/minecraft/belkoin_wallet.png"
import Elytra from "@repo/assets/images/minecraft/elytra.webp"
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ShopSelectCurrency } from "./shop-footer";
import { ReactNode } from "react";
import { Button } from "@repo/ui/button";
import ExpActive from "@repo/assets/images/minecraft/exp-active.webp"
import { ShopPrice } from "./shop-price";
import { StartPayment } from "./subscription-item";
import { z } from "zod/v4";
import { atom } from "@reatom/core";

const SHOP_ITEMS: Record<StoreCategory, ReactNode> = {
  "donate": <DonatesList />,
  "wallet": <WalletsList />,
  "events": null,
}

const ShopItems = reatomComponent(({ ctx }) => {
  const category = ctx.spy(storeCategoryAtom)

  return SHOP_ITEMS[category]
}, "ShopItemsList")

const ShopActivePaymentInfo = reatomComponent(({ ctx }) => {
  return (
    <button
      className="btn flex w-fit items-center justify-center rounded-xl bg-neutral-100 px-6 py-2"
      onClick={() => paymentResultDialogIsOpen(ctx, true)}
    >
      <Typography className="text-neutral-900 text-lg">
        Перейти к оплате
      </Typography>
    </button>
  )
}, "ShopActivePaymentInfo")

const ShopNavigation = () => {
  return (
    <TabsList className="flex lg:flex-row justify-between flex-col items-center gap-4 *:h-18 *:sm:h-24 w-full">
      <TabsTrigger
        value="donate"
        className="flex data-[state=active]:bg-gradient-to-r gap-2
        items-center data-[state=active]:border-[#e28100] 
        data-[state=active]:from-[#e28100] data-[state=active]:via-[#e28100] 
        data-[state=active]:to-[#ffaa00] w-full data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2"
      >
        <Typography color="white" className="text-xl lg:text-2xl">
          Привилегии
        </Typography>
        <img src={Elytra} loading="lazy" width={28} height={28} alt="" />
      </TabsTrigger>
      <TabsTrigger
        value="wallet"
        className="flex data-[state=active]:bg-gradient-to-r gap-2 
        items-center data-[state=active]:border-[#db1ed7] 
        data-[state=active]:from-[#db1ed7] data-[state=active]:via-[#db1ed7] 
        data-[state=active]:to-[#f73ef6] w-full data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2"
      >
        <Typography color="white" className="text-xl lg:text-2xl">
          Валюта
        </Typography>
        <img src={Belkoin} loading="lazy" width={28} height={28} alt="" />
      </TabsTrigger>
      <TabsTrigger
        value="events"
        className="flex data-[state=active]:bg-gradient-to-r gap-2 
        items-center data-[state=active]:border-[#05b458] 
        data-[state=active]:from-[#05b458] data-[state=active]:via-[#05b458] 
        data-[state=active]:to-[#0fd86d] w-full data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2"
      >
        <Typography color="white" className="text-xl lg:text-2xl">
          Ивенты
        </Typography>
        <img src={EndCrystal} loading="lazy" width={28} height={28} alt="" />
      </TabsTrigger>
    </TabsList>
  )
}

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
          <ShopSelectCurrency />
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

  const isValid = (shopItemState.paymentType !== null) && (shopItemState.paymentValue !== null)

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
          <ShopPrice />
        </div>
      </div>
      <div className="flex items-center w-fit">
        <ShopStart />
      </div>
    </div>
  )
}

const ShopContent = () => {
  return (
    <div
      className="flex flex-col items-center p-4 w-full xl:w-3/4 h-full bg-neutral-900 rounded-sm"
    >
      <TabsContents className="w-full">
        <TabsContent value="donate" className="flex flex-col gap-4 w-full h-full">
          <SelectedDonate />
          <ShopPreFooter />
          <ShopFooter />
        </TabsContent>
        <TabsContent value="wallet" className="flex flex-col gap-4 w-full h-full">
          <SelectedWallet />
          <ShopPreFooter />
          <ShopFooter />
        </TabsContent>
        <TabsContent value="events" className="flex flex-col gap-4 w-full h-full">
          <EventsList />
        </TabsContent>
      </TabsContents>
    </div>
  )
}

const ShopTarget = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-center min-h-16 w-full rounded-lg px-4 py-3 bg-neutral-50">
        <Typography color="black" className="text-lg">
          Выберите товар
        </Typography>
      </div>
      <ShopItems />
    </div>
  )
}

export const Shop = reatomComponent(({ ctx }) => {
  const type = ctx.spy(paymentResultType)

  const isActive = type ? type === 'created' : false

  const handle = (category: StoreCategory) => {
    storeCategoryAtom(ctx, category)
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {isActive ? (
        <div className="flex flex-col w-full justify-start gap-4">
          <div className="flex flex-col">
            <Typography className="text-xl">
              У вас сейчас активный заказ!
            </Typography>
            <Typography color="gray" className="text-base">
              Заказ будет активен в течении 10 минут
            </Typography>
          </div>
          <ShopPaymentModal />
          <ShopActivePaymentInfo />
        </div>
      ) : (
        <Tabs
          value={ctx.spy(storeCategoryAtom)}
          onValueChange={v => handle(v as StoreCategory)}
          defaultValue="donate"
          className="flex flex-col w-full gap-8"
        >
          <ShopNavigation />
          <div className="flex flex-col xl:flex-row items-start w-full h-fit gap-4">
            <div className="flex p-2 w-full xl:w-1/4 h-full bg-neutral-900 rounded-sm">
              <ShopTarget />
            </div>
            <ShopContent />
          </div>
        </Tabs >
      )}
    </div >
  )
}, "Shop")