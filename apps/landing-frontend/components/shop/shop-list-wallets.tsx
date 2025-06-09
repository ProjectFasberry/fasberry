import { headerUserQuery } from "#components/layout/default/header";
import { Button } from "@repo/landing-ui/src/button";
import { Input } from "@repo/landing-ui/src/input";
import { Skeleton } from "@repo/landing-ui/src/skeleton";
import { Typography } from "@repo/landing-ui/src/typography";
import Charism from "@repo/assets/images/minecraft/charism_wallet.png"
import Belkoin from "@repo/assets/images/minecraft/belkoin_wallet.png"
import { useQueryClient } from "@tanstack/react-query";
import { ShopFooter } from "./shop-footer";
import { useState } from "react";
import { DONATES_QUERY_KEY, donatesQuery } from "./shop-list-donates";
import { SHOP_ITEM_QUERY_KEY, ShopItemQuery, shopItemQuery } from "./shop";

export type Wallets = {
  type: string;
  value: number;
}

export const walletsMap: Record<string, { title: string; img: string; description: string }> = {
  "charism": {
    title: "Харизма",
    description: "Харизма используется при покупке большинства игровых предметов у продавцов или использовании их в аукционе.",
    img: Charism.src
  },
  "belkoin": {
    title: "Белкоин",
    description: "Белкоин используется при покупке уникальных предметов, персонализации или некоторых привилегий.",
    img: Belkoin.src
  },
}

const validateNumber = (input: string): number | null => {
  const num = Number(input);
  return Number.isFinite(num) ? num : null;
};

export const ShopNickname = () => {
  const qc = useQueryClient()
  const { data } = shopItemQuery()
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const { data: userFromCookies } = headerUserQuery()

  const curr: string = data?.nickname ?? ""

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    qc.setQueryData(SHOP_ITEM_QUERY_KEY, (prev: ShopItemQuery) => ({ ...prev, nickname: e.target.value }))
  }

  const setNickname = (nickname: string) => {
    qc.setQueryData(SHOP_ITEM_QUERY_KEY, (prev: ShopItemQuery) => ({ ...prev, nickname }))
  }

  const hideTip = () => {
    if (!userFromCookies) return;

    setIsVisible(false)
    setNickname(userFromCookies)
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography className="text-[18px]">
        Укажите никнейм
      </Typography>
      <div className="flex flex-col lg:flex-row items-center gap-2 w-full">
        <Input
          type="text"
          maxLength={32}
          className="px-4 w-full lg:w-1/3"
          placeholder="Введите никнейм"
          value={curr}
          name="nickname"
          autoComplete="off"
          onChange={onChange}
        />
        {(isVisible && userFromCookies) && (
          <div className="flex items-center min-h-10 lg:min-h-14 w-full lg:w-fit bg-neutral-700 px-4 py-1 h-full rounded-lg gap-4">
            <Typography>
              Ваш ник {userFromCookies}?
            </Typography>
            <div className="flex flex-col lg:flex-row items-center gap-2">
              <Button
                className="bg-green rounded-md py-1 w-full lg:w-fit"
                onClick={hideTip}
              >
                <Typography className="text-neutral-950 text-[14px]">
                  Да
                </Typography>
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                className="bg-red rounded-md py-1 w-full lg:w-fit"
              >
                <Typography className="text-neutral-950 text-[14px]">
                  Нет
                </Typography>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type CurrentPriceProps = Wallets

const CurrentPrice = ({ type, value }: CurrentPriceProps) => {
  return (
    <div className="flex items-center">
      <Typography className="text-[14px] text-neutral-600 dark:text-neutral-400">
        *Текущий курс: 1&nbsp;
      </Typography>
      <img src={walletsMap[type]?.img} width={16} height={16} alt="" />
      <Typography className="text-[14px] text-neutral-600 dark:text-neutral-400">
        &nbsp;= {value} RUB
      </Typography>
    </div>
  )
}

export const WalletsList = () => {
  const { data: shopItemState } = shopItemQuery()
  const qc = useQueryClient()
  const { data, isLoading } = donatesQuery("wallet");

  const selectedWallet = shopItemState?.paymentType;

  if (isLoading) {
    return (
      <>
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </>
    )
  }

  const wallets = data as Wallets[];

  const changeWallet = (type: "charism" | "belkoin") => {
    if (type === selectedWallet) return;

    const wallet = wallets.find(w => w.type === type)

    if (!wallet) return;

    qc.setQueryData(SHOP_ITEM_QUERY_KEY,
      (prev: ShopItemQuery) => ({
        ...prev, 
        paymentType: type,
        category: "wallet"
      })
    )
  }

  if (!wallets) {
    return (
      <Typography>
        Пусто
      </Typography>
    )
  }

  return (
    wallets.map(w => (
      <div
        key={w.type}
        className={`flex items-center w-full min-h-16 gap-4 rounded-lg px-4 py-3 border-2 
          bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer
          ${w.type === selectedWallet ? 'border-green' : 'border-transparent'}`}
        onClick={() => changeWallet(w.type as "charism" | "belkoin")}
      >
        <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
          <img src={walletsMap[w.type]?.img} width={36} height={36} alt="" />
        </div>
        <Typography className="text-[20px]">
          {walletsMap[w.type]?.title}
        </Typography>
      </div>
    ))
  )
}

const SelectWalletValue = () => {
  const qc = useQueryClient()
  const { data: shopItemState } = shopItemQuery()

  const selectedValue = shopItemState?.paymentValue ?? ""

  const setSelectedWalletValue = (value: number) => {
    qc.setQueryData(SHOP_ITEM_QUERY_KEY, (prev: ShopItemQuery) => ({
      ...prev, paymentValue: value
    }))
  }

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
              setSelectedWalletValue(value)
            }
          }}
        />
      </div>
    </div>
  )
}

const SelectedWallet = () => {
  const qc = useQueryClient()
  const { data: shopItemState } = shopItemQuery();

  const currentWallets = qc.getQueryData<Wallets[]>(DONATES_QUERY_KEY("wallet"));

  const selectedWallet = currentWallets
    ? currentWallets.find(cw => cw.type === shopItemState?.paymentType)
    : null;

  return (
    selectedWallet ? (
      <>
        <div className="flex flex-col w-full items-center justify-center border-2 border-neutral-600/40 rounded-xl p-4">
          <Typography className="text-lg md:text-xl lg:text-2xl">
            {walletsMap[selectedWallet.type]?.title}
          </Typography>
          <Typography className="text-neutral-600 dark:text-neutral-400 text-center text-sm md:text-base lg:text-lg">
            {walletsMap[selectedWallet.type]?.description}
          </Typography>
        </div>
        <div className="flex flex-col gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4">
          <ShopNickname />
          <SelectWalletValue />
          <CurrentPrice type={selectedWallet.type} value={selectedWallet.value} />
        </div>
      </>
    ) : (
      <Typography className="text-2xl">
        Валюта не выбрана
      </Typography>
    )
  )
}

export const WalletList = () => {
  return (
    <>
      <SelectedWallet />
      <ShopFooter />
    </>
  )
}