"use client"

import { Tabs, TabsContent } from "@repo/landing-ui/src/tabs"
import { ShopNavigation } from "./shop-navigation"
import { WalletList, WalletsList } from "./shop-list-wallets"
import { EventsList } from "./shop-list-events"
import { DonateList, DonatesList } from "./shop-list-donates"
import { Typography } from "@repo/landing-ui/src/typography"
import { Button } from "@repo/landing-ui/src/button"
import { useQueryClient } from "@tanstack/react-query";
import { PAYMENT_STATUS_QUERY_KEY, paymentStatusQuery, PaymentStatusQuery } from "./shop-payment-status"
import { ShopPaymentModal } from "./shop-payment-modal"
import { useQuery } from '@tanstack/react-query';
import { PaymentCurrency } from "@repo/shared/constants/currencies"

type PaymentValueType = string | number
type PaymentType = "donate" | "belkoin" | "charism" | "item" | "event"

export const SHOP_ITEM_QUERY_KEY = ['shop', 'item']

export type ShopItemQuery = Partial<{
  paymentType: PaymentType
  paymentValue: PaymentValueType
  nickname: string,
}> & {
  currency: PaymentCurrency,
  fiatMethod: "creditCard" | "sbp",
  category: "donate" | "wallet" | "events"
}

export const shopItemQuery = () => useQuery<
  ShopItemQuery, Error
>({
  queryKey: SHOP_ITEM_QUERY_KEY,
  initialData: {
    currency: "RUB",
    category: "donate",
    fiatMethod: "creditCard"
  }
});

const ShopItemsList = () => {
  const { data } = shopItemQuery()

  const category = data?.category ?? "donate"

  return (
    <>
      {category === "donate" && <DonatesList />}
      {category === "wallet" && <WalletsList />}
      {category === "events" && null}
    </>
  )
}

const ShopActivePaymentInfo = () => {
  const qc = useQueryClient()

  const handleOpen = () => {
    qc.setQueryData(PAYMENT_STATUS_QUERY_KEY,
      (prev: PaymentStatusQuery) => ({ ...prev, isOpened: true })
    )
  }

  return (
    <Button
      className="flex w-fit items-center justify-center rounded-xl bg-neutral-100 px-6 py-2"
      onClick={handleOpen}
    >
      <Typography className="text-neutral-900 text-lg">
        Перейти к оплате
      </Typography>
    </Button>
  )
}

export const Shop = () => {
  const { data: paymentStatus } = paymentStatusQuery()

  const isActive = paymentStatus ? paymentStatus.type === 'created' : false

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {isActive ? (
        <div className="flex flex-col w-full justify-start gap-4">
          <div className="flex flex-col">
            <Typography className="text-xl">
              У вас сейчас активный заказ!
            </Typography>
            <Typography text_color="adaptiveGray" className="text-base">
              Заказ будет активен в течении 10 минут
            </Typography>
          </div>
          <ShopPaymentModal />
          <ShopActivePaymentInfo />
        </div>
      ) : (
        <Tabs
          defaultValue="donate"
          className="flex-col flex gap-8"
        >
          <ShopNavigation />
          <div className="flex flex-col xl:flex-row items-start w-full h-fit gap-4">
            <div className="flex p-2 w-full xl:w-1/4 h-full bg-neutral-300 dark:bg-neutral-900 rounded-lg">
              <div className="flex flex-col gap-4 w-full h-full">
                <div className="flex items-center justify-center min-h-16 w-full rounded-lg px-4 py-3 bg-neutral-400 dark:bg-neutral-50">
                  <Typography className="text-neutral-100 dark:text-neutral-950 text-[20px]">
                    Выберите товар
                  </Typography>
                </div>
                <ShopItemsList />
              </div>
            </div>
            <div
              className="flex flex-col items-center p-4 w-full xl:w-3/4 h-full bg-neutral-300 dark:bg-neutral-900 rounded-lg 
              *:data-[state=active]:flex *:data-[state=inactive]:hidden"
            >
              <TabsContent value="donate" className="flex flex-col gap-4 w-full h-full">
                <DonateList />
              </TabsContent>
              <TabsContent value="wallet" className="flex flex-col gap-4 w-full h-full">
                <WalletList />
              </TabsContent>
              <TabsContent value="events" className="flex flex-col gap-4 w-full h-full">
                <EventsList />
              </TabsContent>
            </div>
          </div>
        </Tabs >
      )}
    </div >
  )
}