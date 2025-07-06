import { action, atom } from "@reatom/core";
import { tv } from "tailwind-variants";
import { PaymentType, PaymentValueType, storeItem } from "./store.model";
import { Typography } from "@repo/ui/typography";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { IconSelect } from "@tabler/icons-react";

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
  const current = ctx.spy(storeItem)?.paymentValue

  const result = current === target;
  const variant = result ? "active" : "inactive" as "active" | "inactive"

  return { variant, result }
}, `${target}.selected`)

const selectItem = action((ctx, type: PaymentType, target: PaymentValueType | "arkhont" | "loyal" | "authentic") => {
  const current = ctx.get(storeItem)?.paymentValue

  if (current === target) return;;

  storeItem(ctx, (state) => ({
    ...state, paymentType: type, paymentValue: target,
  }))
}, "selectItem")

export const ItemFooter = reatomComponent<{ price: string, value: string }>(({ ctx, price, value }) => {
  const { result: isSelected, variant } = ctx.spy(selectedAtom(value))

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full gap-2">
      <Typography className="text-base font-semibold bg-neutral-800 p-2 text-nowrap">
        {price} рублей
      </Typography>
      <Button
        onClick={() => selectItem(ctx, "donate", value)}
        className={buyButtonVariants({ variant })}
      >
        <Typography className={buyButtonTypographyVariants({ variant })}>
          {isSelected ? "Выбрано" : "Выбрать"}
        </Typography>
        {isSelected && <IconSelect size={20} className="text-neutral-900" />}
      </Button>
    </div>
  )
}, "ItemFooter")