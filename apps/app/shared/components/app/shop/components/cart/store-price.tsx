import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { storeCurrencyAtom } from "../../models/store.model"
import { cartPriceAtom } from "../../models/store-cart.model"
import { getStaticImage } from "@/shared/lib/volume-helpers"
import { atom } from "@reatom/core"

const CURRENCIES: Record<string, { img: string | null, symbol: string }> = {
  "CHARISM": { img: getStaticImage("donates/charism_wallet.png"), symbol: "C" },
  "BELKOIN": { img: getStaticImage("donates/belkoin_wallet.png"), symbol: "B" },
  "RUB": { img: null, symbol: "₽" },
  "USDT": { img: null, symbol: "T" }
}

const storeCurrencySymbolAtom = atom((ctx) => CURRENCIES[ctx.spy(storeCurrencyAtom)], "storeCurrencySymbol")

export const StorePrice = reatomComponent(({ ctx }) => {
  const { REAL, BELKOIN, CHARISM } = ctx.spy(cartPriceAtom)
  const { img, symbol } = ctx.spy(storeCurrencySymbolAtom)

  return (
    <Typography className="text-lg leading-5 font-semibold">
      {REAL} {symbol}
    </Typography>
  )
}, "StorePrice")