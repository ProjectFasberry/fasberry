import { PAYMENT_CURRENCIES_MAPPING } from "@repo/shared/constants/currencies"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Typography } from "@/shared/ui/typography"
import { Skeleton } from "@/shared/ui/skeleton"
import { Donates, donatesResource, priceByCurrencyAction, storeItem, Wallets } from "./store.model"

const S = ({ currency }: { currency: string }) => {
  useUpdate((ctx) => priceByCurrencyAction(ctx, currency), [currency])
  return null;
}

export const ShopPrice = reatomComponent(({ ctx }) => {
  const shopItemState = ctx.spy(storeItem)
  const priceByCurrency = ctx.spy(priceByCurrencyAction.dataAtom)

  const getFinishedPrice = (value: number = 0): number => {
    if (!shopItemState || !shopItemState?.paymentType) return 0

    const paymentType = shopItemState.paymentType

    let price: number | null = null;

    switch (paymentType) {
      case "belkoin":
      case "charism":
        const currentWallets = ctx.get(donatesResource.dataAtom) as Wallets[]
        const selectedWallet = currentWallets
          ? currentWallets.find(cw => cw.type === shopItemState.paymentType)
          : null;

        if (!selectedWallet) return 0;

        price = value * selectedWallet.value
        break;
      case "donate":
        const currentDonates = ctx.get(donatesResource.dataAtom) as Donates[]

        const selectedDonate = currentDonates
          ? currentDonates.find(cd => cd.origin === shopItemState.paymentValue)
          : null;

        if (!selectedDonate) return 0;

        price = Number(selectedDonate.price);
        break;
    }

    if (shopItemState.currency !== "RUB" && priceByCurrency) {
      const currencyId = PAYMENT_CURRENCIES_MAPPING[shopItemState.currency] as string

      if (priceByCurrency) {
        const target = priceByCurrency[currencyId]

        const raw = (price ?? 0) / (target ? target.rub : 0)

        price = Math.round(raw * 1000000) / 1000000
      } else {
        price = 0
      }
    }

    return price ?? 0;
  }

  const finishedPrice = getFinishedPrice(Number(shopItemState?.paymentValue ?? 0))

  const currency = shopItemState?.currency ?? "RUB"

  return (
    <>
      <S currency={shopItemState.currency} />
      {ctx.spy(priceByCurrencyAction.statusesAtom).isPending ? <Skeleton className="h-6 w-34" /> : (
        <Typography className="text-[18px]">
          {ctx.spy(priceByCurrencyAction.statusesAtom).isRejected ? "Ошибка" : `${finishedPrice} ${currency}`}
        </Typography>
      )}
    </>
  )
}, "ShopPrice")