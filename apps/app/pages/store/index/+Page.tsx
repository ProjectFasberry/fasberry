import { StoreFilters } from "@/shared/components/app/shop/components/filters/store-filters";
import { StoreList } from "@/shared/components/app/shop/components/items/store-list";
import { SetRecipientDialog } from "@/shared/components/app/shop/components/recipient/set-recipient";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { validateNumber } from "@/shared/lib/validate-primitives";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { atom } from "@reatom/core";
import { withReset } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Switch } from "@repo/ui/switch";
import { Typography } from "@repo/ui/typography";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";

const walletTypeAtom = atom<"charism" | "belkoin">("charism", "walletType")
const walletValueAtom = atom<number>(0, "walletValue").pipe(withReset())

walletTypeAtom.onChange((ctx, _) => walletValueAtom.reset(ctx))

const WalletInput = reatomComponent(({ ctx }) => {
  return (
    <Input
      type="text"
      maxLength={8}
      className="px-4 w-full lg:w-1/3"
      placeholder="Количество"
      value={ctx.spy(walletValueAtom)}
      onChange={e => {
        const value = validateNumber(e.target.value);

        if (value !== null) {
          walletValueAtom(ctx, value)
        }
      }}
    />
  )
}, "WalletInput")

const WalletType = reatomComponent(({ ctx }) => {
  const current = ctx.spy(walletTypeAtom);

  return (
    <div
      className="flex items-center gap-2 
        *:px-4 *:py-1 *:cursor-pointer *:rounded-xl 
        *:data-[state=inactive]:bg-neutral-800/10 *:data-[state=active]:bg-neutral-800 
        *:h-10"
    >
      <div
        data-state={current === 'charism' ? "active" : "inactive"}
        onClick={() => walletTypeAtom(ctx, "charism")}
      >
        <Typography className="font-semibold">Харизма</Typography>
      </div>
      <div
        data-state={current === 'belkoin' ? "active" : "inactive"}
        onClick={() => walletTypeAtom(ctx, "belkoin")}
      >
        <Typography className="font-semibold">Белкоин</Typography>
      </div>
    </div>
  )
}, "WalletType")

const WalletsStore = () => {
  return (
    <>
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full relative">
        <div className="flex flex-col h-full gap-12 w-full lg:w-2/5 sticky top-0 pt-4">
          <div className="flex items-center gap-4 rounded-lg p-4 bg-blue-600/70 backdrop-blur-md">
            <img src={getStaticImage("icons/boosts_icon.png")} width={112} height={112} alt="" />
            <div className="flex flex-col gap-2 *:font-medium text-lg">
              <Typography>1. Введите желаемое кол-во валюты</Typography>
              <Typography>2. Выберите способ оплаты</Typography>
              <Typography>3. Оплатите</Typography>
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full h-full">
            <Typography className="text-2xl font-semibold">
              У каждой валюты своя себестоимость относительно рублей
            </Typography>
            <div className="flex flex-col gap-2 *:p-4 w-full h-full *:rounded-lg">
              <Input
                placeholder="Никнейм"
                className="bg-transparent placeholder:font-semibold border-2 border-neutral-600"
              />
              <Input
                placeholder="Почта"
                className="bg-transparent placeholder:font-semibold border-2 border-neutral-600"
              />
              <WalletType />
              <WalletInput />
              <Input
                placeholder="Количество"
                className="bg-transparent placeholder:font-semibold border-2 border-neutral-600"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full gap-4 w-full lg:w-3/5">
          <Typography>
            ...
          </Typography>
        </div>
      </div>
    </>
  )
}

const DefaultStore = () => {
  return (
    <>
      <Typography className="text-3xl font-semibold">
        Магазин
      </Typography>
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-col gap-4 lg:flex-row items-start w-full h-full">
          <div className="flex flex-col gap-2 h-full w-full lg:w-1/5">
            <div className="flex flex-col gap-6 p-4 bg-neutral-900 w-full h-full rounded-lg">
              <StoreFilters />
            </div>
            <Button
              id="to-wallet-store"
              className="border-2 border-neutral-50/10 hover:bg-neutral-50/10 bg-transparent"
              onClick={() => navigate("/store?q=wallet")}
            >
              <Typography className="font-semibold truncate text-nowrap">
                Покупка игровой валюты
              </Typography>
            </Button>
          </div>
          <div className="flex flex-col w-full lg:w-4/5 min-h-[85vh] bg-neutral-900 gap-8 rounded-lg">
            <div className="flex flex-col items-start w-full h-fit p-2 sm:p-3 lg:p-4 gap-4">
              <StoreList />
              <SetRecipientDialog />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function StorePage() {
  const search = usePageContext().urlParsed.search;
  const targetIsWallet = search["q"] === 'wallet'

  return (
    <MainWrapperPage padding="small">
      <div className="flex flex-col gap-4 w-full h-full">
        {targetIsWallet ? <WalletsStore /> : <DefaultStore />}
      </div>
    </MainWrapperPage>
  )
}