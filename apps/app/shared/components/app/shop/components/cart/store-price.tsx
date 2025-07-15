import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { storeCurrencyAtom } from "../../models/store.model"
import { cartPriceAtom } from "../../models/store-cart.model"

export const StorePrice = reatomComponent(({ ctx }) => {
  const target = ctx.spy(cartPriceAtom)
  const currency = ctx.spy(storeCurrencyAtom)

  return (
    <Typography className="text-lg leading-5 font-semibold">
      {`${target} ${currency}`}
    </Typography>
  )
}, "StorePrice")