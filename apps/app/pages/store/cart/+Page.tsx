import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { ReactNode } from "react";
import { CartOrders } from "@/shared/components/app/shop/components/cart/cart-orders";
import { CartContent } from "@/shared/components/app/shop/components/cart/cart-content";
import { CartLoader } from "@/shared/components/app/shop/components/cart/cart-loader";
import { CartNavigation, StoreCartType, storeCartTypeAtom } from "@/shared/components/app/shop/components/cart/cart-navigation";
import { CartPrefs } from "@/shared/components/app/shop/components/cart/cart-prefs";

const COMPONENTS: Record<StoreCartType, ReactNode> = {
  "content": <CartContent />,
  "orders": <CartOrders />,
  "prefs": <CartPrefs />
}

const Cart = reatomComponent(({ ctx }) => COMPONENTS[ctx.spy(storeCartTypeAtom)])

export default function Page() {
  return (
    <>
      <CartLoader />
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="flex items-center gap-2">
          <Typography className="text-3xl font-semibold">
            Хранилище
          </Typography>
        </div>
        <CartNavigation />
        <Cart />
      </div>
    </>
  )
}