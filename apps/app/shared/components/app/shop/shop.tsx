import EndCrystal from "@repo/assets/images/minecraft/end_crystal.webp"
import Belkoin from "@repo/assets/images/minecraft/belkoin_wallet.png"
import Elytra from "@repo/assets/images/minecraft/elytra.webp"
import ExpActive from "@repo/assets/images/minecraft/exp-active.webp"
import Duo from '@repo/assets/gifs/duo.gif';
import { SelectedWallet, WalletsList } from "./shop-list-wallets"
import { EventsList } from "./shop-list-events"
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import {
  paymentResult,
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
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ShopSelectCurrency } from "./shop-footer";
import { ReactNode } from "react";
import { Button } from "@repo/ui/button";
import { ShopPrice } from "./shop-price";
import { StartPayment } from "./subscription-item";
import { z } from "zod/v4";
import { atom } from "@reatom/core";
import { ShopAreaItem } from "./shop-area"
import { ShopFinishedPreview } from "./shop-preview"
import { ShopPaymentStatus } from "./shop-payment-status";
import { Dialog, DialogClose, DialogContent } from "@repo/ui/dialog";
import { IconBasket } from "@tabler/icons-react";
import { Sheet, SheetTrigger, SheetContent,SheetTitle } from "@repo/ui/sheet"

const SHOP_ITEMS: Record<StoreCategory, ReactNode> = {
  "donate": <DonatesList />,
  "wallet": <WalletsList />,
  "events": <EventsList />
}

const ShopItems = reatomComponent(({ ctx }) => {
  const category = ctx.spy(storeCategoryAtom)
  return SHOP_ITEMS[category]
}, "ShopItemsList")

const ShopActivePaymentInfo = reatomComponent(({ ctx }) => {
  return (
    <Button
      className="flex w-fit items-center justify-center rounded-xl bg-neutral-100 px-6 py-2"
      onClick={() => paymentResultDialogIsOpen(ctx, true)}
    >
      <Typography className="text-neutral-900 text-lg">
        Перейти к оплате
      </Typography>
    </Button>
  )
}, "ShopActivePaymentInfo")

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

const basketIsOpenAtom = atom<boolean>((ctx) => {
  const items = ctx.spy(storeItem).paymentValue

  if (items) {
    return true;
  }

  return false
}, "basketIsOpen")

const Basket = reatomComponent(({ ctx }) => {
  const basketIsOpen = ctx.spy(basketIsOpenAtom)
  if (!basketIsOpen) return null;

  const type = ctx.spy(storeItem).paymentType

  return (
    <Sheet>
      <SheetTrigger className="fixed bottom-4 right-4 bg-white/10 p-2 rounded-lg cursor-pointer">
        <IconBasket size={38} />
      </SheetTrigger>
      <SheetContent side="bottom" className="flex flex-col gap-4 bg-neutral-900 border-none rounded-lg">
        {type === 'donate' && <SelectedDonate />}
        {(type === 'belkoin' || type === 'charism') && <SelectedWallet />}
        <ShopPreFooter />
        <ShopFooter />
      </SheetContent>
    </Sheet>
  )
}, "Basket")

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

const ShopPaymentModal = reatomComponent(({ ctx }) => {
  const result = ctx.spy(paymentResult)
  if (!result) return null;

  const isFinished = result.status === 'success' || result.status === 'canceled'

  return (
    <Dialog
      open={ctx.spy(paymentResultDialogIsOpen)}
      onOpenChange={v => paymentResultDialogIsOpen(ctx, v)}
    >
      <DialogContent className="!max-w-3xl">
        <ShopAreaItem image={Duo}>
          <div className="flex flex-col items-center w-full gap-4">
            <div className="flex flex-col">
              <Typography className="text-xl text-center">
                Заказ создан
              </Typography>
              <Typography color="gray" className="text-base text-center">
                У вас есть 10 минут для того, чтобы оплатить заказ
              </Typography>
            </div>
            <ShopFinishedPreview />
            <div className="flex items-center gap-4">
              {!isFinished && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full lg:w-fit hover:bg-[#05b458] duration-300 bg-[#088d47] rounded-lg py-4 px-12"
                >
                  <Typography color="white" className="text-[20px] font-semibold">
                    Оплатить
                  </Typography>
                </a>
              )}
              {isFinished && (
                <DialogClose>
                  <button
                    className="btn w-full lg:w-fit bg-neutral-700 duration-300 rounded-lg py-4 px-12"
                  >
                    <Typography color="white" className="text-[20px] font-semibold">
                      Вернуться
                    </Typography>
                  </button>
                </DialogClose>
              )}
            </div>
            <ShopPaymentStatus />
          </div>
        </ShopAreaItem>
      </DialogContent>
    </Dialog>
  )
}, "ShopPaymentModal")

const ActiveItems = () => {
  return (
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
  )
}

const CATEGORIES = [
  {
    name: "Привилегии",
    value: "donate",
  },
  // {
  //   name: "Валюта",
  //   value: "wallet",
  // },
  {
    name: "Ивенты",
    value: "events",
  },
]


{/* <label htmlFor={item.value} className="flex items-center gap-2 bg-neutral-800 rounded-md p-2">
  <Checkbox
    defaultChecked
    id={item.value}
  />
  <Typography color="white" className="text-base">
    {item.name}
  </Typography>
</label> */}

export const Shop = reatomComponent(({ ctx }) => {
  const type = ctx.spy(paymentResultType)

  const isActive = type ? type === 'created' : false

  const handle = (category: StoreCategory) => {
    storeCategoryAtom(ctx, category)
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <Basket />
      {isActive ? <ActiveItems /> : (
        <Tabs
          value={ctx.spy(storeCategoryAtom)}
          onValueChange={v => handle(v as StoreCategory)}
          defaultValue="donate"
          className="flex flex-col lg:flex-row items-start w-full h-full"
        >
          <div className="flex flex-col p-4 bg-neutral-900 h-full w-full lg:w-1/5 rounded-lg">
            <div className="flex flex-col gap-2">
              <Typography color="gray" className="text-lg">
                Тип товара
              </Typography>
              <TabsList className='flex flex-col gap-2 w-full'>
                {CATEGORIES.map(item => (
                  <TabsTrigger
                    value={item.value}
                    className="flex justify-start items-center w-full gap-2 group
                    data-[state=active]:bg-neutral-50 duration-500 data-[state=inactive]:bg-neutral-800 p-2"
                  >
                    <Typography className="font-semibold text-base group-data-[state=active]:text-neutral-900">
                      {item.name}
                    </Typography>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
          <div className="flex flex-col w-full lg:w-4/5 min-h-[85vh] bg-neutral-900 gap-8 rounded-lg">
            <div className="flex flex-col items-start w-full h-fit p-4 gap-4">
              <TabsContents className="w-full">
                <TabsContent value="donate" className="h-full w-full">
                  <ShopItems />
                </TabsContent>
                <TabsContent value="wallet" className="h-full w-full">
                  <ShopItems />
                </TabsContent>
                <TabsContent value="events" className="w-full h-full">
                  <ShopItems />
                </TabsContent>
              </TabsContents>
            </div>
          </div>
        </Tabs>
      )}
    </div >
  )
}, "Shop")