import { atom } from "@reatom/core";
import { tv } from "tailwind-variants";
import { selectStoreItem, storeBasketDataAtom } from "../models/store.model";
import { Typography } from "@repo/ui/typography";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { IconSelect } from "@tabler/icons-react";
import Inspect from "@repo/assets/images/minecraft/block_inspect.webp"

const buyButtonVariants = tv({
  base: `group gap-2 duration-150 *:duration-150 px-4 w-full rounded-lg`,
  variants: {
    variant: {
      active: "bg-neutral-50 hover:bg-neutral-200",
      inactive: "hover:bg-green-800 bg-green-700"
    }
  },
  defaultVariants: {
    variant: "inactive"
  }
})

const buyButtonTypographyVariants = tv({
  base: `font-semibold text-base`,
  variants: {
    variant: {
      active: "text-neutral-900",
      inactive: "text-neutral-50"
    }
  },
  defaultVariants: {
    variant: "inactive"
  }
})

const selectedAtom = (target: string) => atom((ctx) => {
  const isSelected = ctx.spy(storeBasketDataAtom).find(t => t.value === target)
  const variant = isSelected ? "active" : "inactive" as "active" | "inactive"
  return { variant, isSelected }
}, `${target}.selected`)

export const ItemFooter = reatomComponent<{ price: string, value: string }>(({ ctx, price, value }) => {
  const { isSelected, variant } = ctx.spy(selectedAtom(value))

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <Typography className="text-base font-semibold bg-neutral-800 text-nowrap">
        {price} рублей
      </Typography>
      <Button onClick={() => selectStoreItem(ctx, "donate", value)} className={buyButtonVariants({ variant })}>
        <Typography className={buyButtonTypographyVariants({ variant })}>
          {isSelected ? "В корзине" : "Купить"}
        </Typography>
        {isSelected && <IconSelect size={20} className="text-neutral-900" />}
      </Button>
    </div>
  )
}, "ItemFooter")

export const ItemsNotFound = () => {
  return (
    <div className="flex flex-col gap-2 items-center h-full justify-center w-full">
      <img src={Inspect} width={64} height={64} alt="" />
      <Typography className="text-xl font-semibold">Доступных товаров нет</Typography>
    </div>
  )
}