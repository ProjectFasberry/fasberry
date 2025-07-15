import { Typography } from "@repo/ui/typography"
import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { itemsResource, StoreItem as StoreItemProps } from "../../models/store.model"
import { createLink } from "@/shared/components/config/link"
import { Button } from "@repo/ui/button"
import { atom } from "@reatom/core"
import { cartDataAtom, selectItemToCart } from "../../models/store-cart.model"
import { tv } from "tailwind-variants"
import { IconSelect } from "@tabler/icons-react"
import Inspect from "@repo/assets/images/minecraft/block_inspect.webp"

const StoreItemSkeleton = () => {
  return (
    <div className="flex flex-col h-50 items-center w-full gap-2 overflow-hidden rounded-lg p-2 bg-neutral-800">
      <Skeleton className="w-[64px] h-[64px]" />
      <div className="flex flex-col w-full gap-2 justify-center items-center">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

const StoreListSkeleton = () => {
  return (
    <>
      <StoreItemSkeleton />
      <StoreItemSkeleton />
      <StoreItemSkeleton />
    </>
  )
}

const CURRENCIES: Record<string, string> = {
  "charism": "харизмы",
  "belkoin": "белкоинов",
  "real": "рублей"
}

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

const getItemStatusAtom = (origin: string) => atom((ctx) => {
  const isSelected = ctx.spy(cartDataAtom).find(t => t.origin === origin)
  
  const variant: "active" | "inactive" = isSelected ? "active" : "inactive"

  return { variant, isSelected }
}, `${origin}.status`)

const ItemFooter = reatomComponent<{ price: number, origin: string, wallet: string }>(({
  ctx, price, origin, wallet
}) => {
  const { isSelected, variant } = ctx.spy(
    getItemStatusAtom(origin)
  )

  const currency = CURRENCIES[wallet]

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <Typography className="text-base font-semibold bg-neutral-800 text-nowrap">
        {price} {currency}
      </Typography>
      <Button
        className={buyButtonVariants({ variant })}
        onClick={() => selectItemToCart(ctx, origin)}
      >
        <Typography className={buyButtonTypographyVariants({ variant })}>
          {isSelected ? "В корзине" : "Купить"}
        </Typography>
        {isSelected && <IconSelect size={20} className="text-neutral-900" />}
      </Button>
    </div>
  )
}, "ItemFooter")

const StoreItem = ({
  description, origin, title, price, imageUrl, details: { wallet }
}: StoreItemProps) => {
  return (
    <div className="flex flex-col items-center w-full gap-2 overflow-hidden rounded-lg p-2 bg-neutral-800">
      <a href={createLink("store", origin)} className="flex items-center justify-center bg-neutral-600/40 p-4 rounded-lg">
        <img src={imageUrl} draggable={false} width={48} height={48} alt="" className="min-h-[48px] min-w-[48px]" />
      </a>
      <div className="flex flex-col w-full justify-center items-center">
        <a href={createLink("store", origin)}>
          <Typography className="text-xl font-semibold" color="white">
            {title}
          </Typography>
        </a>
        <Typography color="gray" className="truncate text-sm w-full text-center">
          {description}
        </Typography>
      </div>
      <ItemFooter price={price} origin={origin} wallet={wallet} />
    </div>
  )
}

const ItemsNotFound = () => {
  return (
    <div className="flex flex-col gap-2 items-center h-full justify-center w-full">
      <img src={Inspect} width={64} height={64} alt="" />
      <Typography className="text-xl font-semibold">Доступных товаров нет</Typography>
    </div>
  )
}

export const StoreList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(itemsResource.dataAtom)
  const isLoading = ctx.spy(itemsResource.statusesAtom).isPending

  if (!isLoading && !data.length) return <ItemsNotFound />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-auto gap-4 w-full h-full">
      {isLoading ? <StoreListSkeleton /> : (
        data.map(t => <StoreItem key={t.origin} {...t} />)
      )}
    </div>
  )
}, "StoreList")