import Duo from '@repo/assets/gifs/duo.gif';
import { WalletsList } from "./store-wallets"
import { EventsList } from "./store-events"
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import {
  paymentResult,
  paymentResultDialogIsOpen,
  paymentResultType,
  StoreCategory,
  storeCategoryAtom,
} from "../models/store.model"
import { DonatesList } from "./store-donates"
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ReactNode } from "react";
import { Button } from "@repo/ui/button";
import { StoreFinishedPreview } from "./store-preview"
import { StorePaymentStatus } from "./store-payment-status";
import { Dialog, DialogClose, DialogContent } from "@repo/ui/dialog";

const ITEMS: Record<StoreCategory, ReactNode> = {
  "donate": <DonatesList />,
  "wallet": <WalletsList />,
  "events": <EventsList />
}

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

const Items = reatomComponent(({ ctx }) => {
  const category = ctx.spy(storeCategoryAtom)
  return ITEMS[category]
}, "ShopItemsList")

const ActivePaymentInfo = reatomComponent(({ ctx }) => {
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

const PaymentModal = reatomComponent(({ ctx }) => {
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
            <StoreFinishedPreview />
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
            <StorePaymentStatus />
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
      <PaymentModal />
      <ActivePaymentInfo />
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

export const Store = reatomComponent(({ ctx }) => {
  const type = ctx.spy(paymentResultType)

  const isActive = type ? type === 'created' : false

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {isActive ? <ActiveItems /> : (
        <Tabs
          value={ctx.spy(storeCategoryAtom)}
          onValueChange={v => storeCategoryAtom(ctx, v as StoreCategory)}
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
                    key={item.value}
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
                  <Items />
                </TabsContent>
                <TabsContent value="wallet" className="h-full w-full">
                  <Items />
                </TabsContent>
                <TabsContent value="events" className="w-full h-full">
                  <Items />
                </TabsContent>
              </TabsContents>
            </div>
          </div>
        </Tabs>
      )}
    </div >
  )
}, "Shop")