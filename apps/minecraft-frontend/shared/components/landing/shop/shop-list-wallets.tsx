import Charism from "@repo/assets/images/minecraft/charism_wallet.png"
import Belkoin from "@repo/assets/images/minecraft/belkoin_wallet.png"
import { ShopFooter } from "./shop-footer";
import { useState } from "react";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@/shared/ui/typography";
import { Input } from "../news/news-page-search";
import { Skeleton } from "@/shared/ui/skeleton";
import { donatesResource, storeItem, validateNumber, Wallets, storeTargetNickname } from "./store.model";

export const walletsMap: Record<string, { title: string; img: string; description: string }> = {
  "charism": {
    title: "Харизма",
    description: "Харизма используется при покупке большинства игровых предметов у продавцов или использовании их в аукционе.",
    img: Charism
  },
  "belkoin": {
    title: "Белкоин",
    description: "Белкоин используется при покупке уникальных предметов, персонализации или некоторых привилегий.",
    img: Belkoin
  },
}

const NicknameInput = reatomComponent(({ ctx }) => {
  return (
    <Input
      type="text"
      maxLength={32}
      className="px-4 w-full lg:w-1/3"
      placeholder="Введите никнейм"
      value={ctx.spy(storeTargetNickname)}
      name="store-recipient"
      autoComplete="off"
      onChange={e => storeTargetNickname(ctx, e.target.value)}
    />
  )
})

export const ShopNickname = reatomComponent(({ ctx }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const { nickname } = { nickname: null }

  const hideTip = () => {
    if (!nickname) return;

    setIsVisible(false)
    storeTargetNickname(ctx, nickname)
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography className="text-[18px]">Укажите никнейм</Typography>
      <div className="flex flex-col lg:flex-row items-center gap-2 w-full">
        <NicknameInput />
        {(isVisible && nickname) && (
          <div className="flex items-center min-h-10 lg:min-h-14 w-full lg:w-fit bg-neutral-700 px-4 py-1 h-full rounded-lg gap-4">
            <Typography>
              Ваш ник {nickname}?
            </Typography>
            <div className="flex flex-col lg:flex-row items-center gap-2">
              <button
                className="btn bg-green rounded-md py-1 w-full lg:w-fit"
                onClick={hideTip}
              >
                <Typography className="text-neutral-950 text-[14px]">
                  Да
                </Typography>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="btn bg-red rounded-md py-1 w-full lg:w-fit"
              >
                <Typography className="text-neutral-950 text-[14px]">
                  Нет
                </Typography>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}, "ShopNickname")

const CurrentPrice = ({ type, value }: Wallets) => {
  const target = walletsMap[type]

  if (!target) return null;

  return (
    <div className="flex items-center">
      <Typography className="text-[14px] text-neutral-600 dark:text-neutral-400">
        *Текущий курс: 1&nbsp;
      </Typography>
      <img src={target.img} width={16} height={16} alt="" />
      <Typography className="text-[14px] text-neutral-600 dark:text-neutral-400">
        &nbsp;= {value} RUB
      </Typography>
    </div>
  )
}

export const WalletsList = reatomComponent(({ ctx }) => {
  const shopItemState = ctx.spy(storeItem)
  const wallets = ctx.spy(donatesResource.dataAtom) as Wallets[]
  const selectedWallet = shopItemState?.paymentType;

  if (ctx.spy(donatesResource.statusesAtom).isPending) {
    return (
      <>
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </>
    )
  }

  const changeWallet = (type: "charism" | "belkoin") => {
    if (type === selectedWallet) return;

    const wallet = wallets.find(w => w.type === type)
    if (!wallet) return;

    storeItem(ctx, (state) => ({ ...state, paymentType: type, category: "wallet" }))
  }

  if (!wallets) {
    return <Typography>Пусто</Typography>
  }

  return (
    wallets.map(({ type, value }, idx) => {
      const target = walletsMap[type]
      if (!target) return null;

      return (
        <div
          key={idx}
          className={`flex items-center w-full min-h-16 gap-4 rounded-lg px-4 py-3 border-2 
              bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer
              ${type === selectedWallet ? 'border-green' : 'border-transparent'}`}
          onClick={() => changeWallet(type as "charism" | "belkoin")}
        >
          <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
            <img src={target.img} width={36} height={36} alt="" />
          </div>
          <Typography className="text-[20px]">
            {target.title}
          </Typography>
        </div>
      )
    })
  )
}, "WalletsList")

const SelectWalletValue = reatomComponent(({ ctx }) => {
  const selectedValue = ctx.spy(storeItem).paymentValue ?? ""

  return (
    <div className="flex flex-col gap-2">
      <Typography className="text-[18px]">
        Укажите количество
      </Typography>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          maxLength={8}
          className="px-4 w-full lg:w-1/3"
          placeholder="Введите сумму"
          value={selectedValue}
          onChange={e => {
            const value = validateNumber(e.target.value);

            if (value !== null) {
              storeItem(ctx, (state) => ({ ...state, paymentValue: value }))
            }
          }}
        />
      </div>
    </div>
  )
}, "SelectWalletValue")

const SelectedWallet = reatomComponent(({ ctx }) => {
  const shopItemState = ctx.spy(storeItem)
  const currentWallets = ctx.spy(donatesResource.dataAtom) as Wallets[]

  const selectedWallet = currentWallets
    ? currentWallets.find(cw => cw.type === shopItemState?.paymentType)
    : null;

  const target = selectedWallet ? walletsMap[selectedWallet.type] : null;

  if (!target || !selectedWallet) return (
    <Typography className="text-2xl">
      Валюта не выбрана
    </Typography>
  )

  return (
    <>
      <div className="flex flex-col w-full items-center justify-center border-2 border-neutral-600/40 rounded-xl p-4">
        <Typography className="text-lg md:text-xl lg:text-2xl">
          {target.title}
        </Typography>
        <Typography color="gray" className="text-center text-sm md:text-base lg:text-lg">
          {target.description}
        </Typography>
      </div>
      <div className="flex flex-col gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4">
        <ShopNickname />
        <SelectWalletValue />
        <CurrentPrice type={selectedWallet.type} value={selectedWallet.value} />
      </div>
    </>
  )
}, "SelectedWallet")

export const WalletList = () => {
  return (
    <>
      <SelectedWallet />
      <ShopFooter />
    </>
  )
}