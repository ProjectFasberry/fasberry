import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { cartPriceAtom } from "../../models/store-cart.model"
import { getStaticImage } from "@/shared/lib/volume-helpers"

export const belkoinImage = getStaticImage("donates/belkoin_wallet.png")
export const charismImage = getStaticImage("donates/charism_wallet.png")

export const CURRENCIES: Record<string, { img: string, symbol: string }> = {
  "CHARISM": { img: charismImage, symbol: "C" },
  "BELKOIN": { img: belkoinImage, symbol: "B" },
}

export const StorePrice = reatomComponent(({ ctx }) => {
  const prices = ctx.spy(cartPriceAtom)

  return (
    <div className="space-y-1">
      {Object.entries(prices).map(([currency, value]) => {
        const { symbol, img } = CURRENCIES[currency] ?? { symbol: currency }

        return (
          <Typography key={currency} className="text-lg leading-5 font-semibold flex items-center gap-1">
            {img ? <img src={img} alt={symbol} className="w-5 h-5 inline-block" /> : symbol} {value}
          </Typography>
        )
      })}
    </div>
  )
}, "StorePrice")