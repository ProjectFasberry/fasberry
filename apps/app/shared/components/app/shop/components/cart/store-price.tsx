import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { cartPriceAtom } from "../../models/store-cart.model"
import { getStaticImage } from "@/shared/lib/volume-helpers"

export const CURRENCIES: Record<string, { img: string | null, symbol: string }> = {
  "CHARISM": { img: getStaticImage("donates/charism_wallet.png"), symbol: "C" },
  "BELKOIN": { img: getStaticImage("donates/belkoin_wallet.png"), symbol: "B" },
  "RUB": { img: null, symbol: "₽" },
  "USDT": { img: null, symbol: "T" }
}

export const StorePrice = reatomComponent(({ ctx }) => {
  const { REAL, BELKOIN, CHARISM } = ctx.spy(cartPriceAtom)

  const prices = {
    RUB: REAL,
    BELKOIN,
    CHARISM,
  }

  return (
    <div className="space-y-1">
      {Object.entries(prices).map(([currency, value]) => {
        const { symbol, img } = CURRENCIES[currency] ?? { symbol: currency }

        return (
          <Typography key={currency} className="text-lg leading-5 font-semibold flex items-center gap-1">
            {value} {img ? <img src={img} alt={symbol} className="w-4 h-4 inline-block" /> : symbol}
          </Typography>
        )
      })}
    </div>
  )
}, "StorePrice")