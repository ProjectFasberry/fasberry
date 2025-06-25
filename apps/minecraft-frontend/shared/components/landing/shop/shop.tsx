import { SelectedWallet, WalletsList } from "./shop-list-wallets"
import { EventsList } from "./shop-list-events"
import { ShopPaymentModal } from "./shop-payment-modal"
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Typography } from "@/shared/ui/typography";
import { donatesResource, paymentResultDialogIsOpen, paymentResultType, StoreItem, storeItem } from "./store.model"
import { DonatesList, SelectedDonate } from "./shop-list-donates"
import EndCrystal from "@repo/assets/images/minecraft/end_crystal.webp"
import Belkoin from "@repo/assets/images/minecraft/belkoin_wallet.png"
import Elytra from "@repo/assets/images/minecraft/elytra.webp"
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ShopFooter } from "./shop-footer";

const S = ({ type }: { type: "donate" | "wallet" | "events" }) => {
  useUpdate((ctx) => donatesResource(ctx, type), [type])
  return null;
}

const ShopItemsList = reatomComponent(({ ctx }) => {
  const { category } = ctx.spy(storeItem)

  switch (category) {
    case "donate":
      return (
        <>
          <S type="donate" />
          <DonatesList />
        </>
      )
    case "events":
      return (
        <>
          <S type="events" />
          {/*  */}
        </>
      )
    case "wallet":
      return (
        <>
          <S type="wallet" />
          <WalletsList />
        </>
      )
  }
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
    <TabsList className="flex lg:flex-row justify-between flex-col items-center !p-0 sm:gap-4 *:h-18 *:sm:h-24 *:duration-300 w-full *:p-2 *:sm:p-4">
      <TabsTrigger
        value="donate"
        className="flex data-[state=active]:bg-gradient-to-r gap-2
        items-center data-[state=active]:border-[#e28100] 
        data-[state=active]:from-[#e28100] data-[state=active]:via-[#e28100] 
        data-[state=active]:to-[#ffaa00] w-full data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2 rounded-xl"
      >
        <Typography className="text-white text-[20px]">
          Привилегии
        </Typography>
        <img src={Elytra} width={28} height={28} alt="" />
      </TabsTrigger>
      <span className="hidden lg:inline text-[20px] text-neutral-300">⏺</span>
      <TabsTrigger
        value="wallet"
        className="flex data-[state=active]:bg-gradient-to-r gap-2 
        items-center data-[state=active]:border-[#db1ed7] 
        data-[state=active]:from-[#db1ed7] data-[state=active]:via-[#db1ed7] 
        data-[state=active]:to-[#f73ef6] w-full data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2 rounded-xl"
      >
        <Typography className="text-white text-[20px]">
          Валюта
        </Typography>
        <img src={Belkoin} width={28} height={28} alt="" />
      </TabsTrigger>
      <span className="hidden lg:inline text-[20px] text-neutral-300">⏺</span>
      <TabsTrigger
        value="events"
        className="flex data-[state=active]:bg-gradient-to-r gap-2 
        items-center data-[state=active]:border-[#05b458] 
        data-[state=active]:from-[#05b458] data-[state=active]:via-[#05b458] 
        data-[state=active]:to-[#0fd86d] w-full data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2 rounded-xl"
      >
        <Typography className="text-white text-[20px]">
          Ивенты
        </Typography>
        <img src={EndCrystal} width={28} height={28} alt="" />
      </TabsTrigger>
    </TabsList>
  )
}

export const Shop = reatomComponent(({ ctx }) => {
  const type = ctx.spy(paymentResultType)
  const isActive = type ? type === 'created' : false

  const handleTabChange = (value: StoreItem["category"]) => {
    // @ts-expect-error
    storeItem(ctx, (state) => ({
      ...state, category: value, paymentType: null, paymentValue: null
    }))
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
          value={ctx.spy(storeItem).category}
          onValueChange={v => handleTabChange(v as StoreItem["category"])}
          defaultValue="donate"
          className="flex flex-col w-full gap-8"
        >
          <ShopNavigation />
          <div className="flex flex-col xl:flex-row items-start w-full h-fit gap-4">
            <div className="flex p-2 w-full xl:w-1/4 h-full bg-neutral-900 rounded-lg">
              <div className="flex flex-col gap-4 w-full h-full">
                <div className="flex items-center justify-center min-h-16 w-full rounded-lg px-4 py-3 bg-neutral-50">
                  <Typography color="black" className="text-lg">
                    Выберите товар
                  </Typography>
                </div>
                <ShopItemsList />
              </div>
            </div>
            <div
              className="flex flex-col items-center p-4 w-full xl:w-3/4 h-full bg-neutral-900 rounded-lg"
            >
              <TabsContents className="w-full">
                <TabsContent value="donate" className="flex flex-col gap-4 w-full h-full">
                  <SelectedDonate />
                  <ShopFooter />
                </TabsContent>
                <TabsContent value="wallet" className="flex flex-col gap-4 w-full h-full">
                  <SelectedWallet />
                  <ShopFooter />
                </TabsContent>
                <TabsContent value="events" className="flex flex-col gap-4 w-full h-full">
                  <EventsList />
                </TabsContent>
              </TabsContents>
            </div>
          </div>
        </Tabs >
      )}
    </div >
  )
}, "Shop")