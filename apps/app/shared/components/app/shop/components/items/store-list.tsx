import { Typography } from "@repo/ui/typography"
import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { itemsAction, StoreItem as StoreItemProps, storeItemsDataAtom } from "../../models/store.model"
import { createLink } from "@/shared/components/config/link"
import { Button } from "@repo/ui/button"
import { tv } from "tailwind-variants"
import { getStaticImage } from "@/shared/lib/volume-helpers"
import { isClientAtom } from "@/shared/models/global.model"
import { getItemStatus, handleItemToCart } from "../../models/store-item.model"
import { CURRENCIES } from "../cart/store-price"

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

const buyButtonVariants = tv({
  base: `group gap-2 duration-150 *:duration-150 px-6 w-full rounded-xl`,
  variants: {
    variant: {
      active: "bg-neutral-50 hover:bg-neutral-200",
      inactive: "bg-[#35C759]/80"
    }
  },
  defaultVariants: {
    variant: "inactive"
  }
})

const buyButtonTypographyVariants = tv({
  base: `font-semibold text-base text-nowrap`,
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

export const ItemPrice = ({ currency, price }: { currency: string, price: string | number }) => {
  return (
    <div className="flex items-center gap-1 text-base select-none text-nowrap font-semibold">
      {CURRENCIES[currency].img ? (
        <img src={CURRENCIES[currency].img} alt={CURRENCIES[currency].symbol} width={24} height={24} />
      ) : (
        <span>{CURRENCIES[currency].symbol}</span>
      )}
      <Typography>
        {price}
      </Typography>
    </div>
  )
}

const Spinner = () => {
  return (
    <svg viewBox="0 0 16 16" height="16" width="16" className="windows-loading-spinner">
      <circle r="7px" cy="8px" cx="8px"></circle>
    </svg>
  )
}

export const ItemSelectToCart = reatomComponent<Pick<StoreItemProps, "id">>(({ ctx, id }) => {
  if (!ctx.spy(isClientAtom)) {
    return <Skeleton className="h-10 w-24" />
  }

  const state = ctx.spy(getItemStatus(id))

  const isLoading = state?.isLoading ?? false
  const isSelected = state?.isSelected ?? false;

  const variant: "active" | "inactive" = isSelected ? "active" : "inactive"

  return (
    <Button
      className={buyButtonVariants({ variant })}
      disabled={isLoading}
      onClick={() => handleItemToCart(ctx, id)}
    >
      {isLoading && <Spinner />}
      <Typography className={buyButtonTypographyVariants({ variant })}>
        {isSelected ? "В корзине" : "Купить"}
      </Typography>
    </Button>
  )
}, "ItemSelectToCart")

const storeItemVariant = tv({
  base: `flex flex-col items-center w-full overflow-hidden rounded-xl justify-between gap-2 p-2 sm:p-4 relative`,
  variants: {
    variant: {
      default: "bg-gradient-to-b from-neutral-700/80 via-neutral-700/70 to-neutral-700/60"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

const StoreItem = ({
  description, id, title, price, imageUrl, currency, summary
}: StoreItemProps) => {
  return (
    <div className={storeItemVariant()}>
      <div className="z-[1] select-none absolute w-full h-full">
        <img src={getStaticImage("patterns/pattern_light.png")} draggable={false} width={600} height={600} alt="" />
      </div>
      <a
        href={createLink("store", id)}
        target="_blank"
        className="flex relative z-[2] items-center justify-center rounded-lg"
      >
        <img src={imageUrl} draggable={false} width={64} height={64} alt="" className="min-h-[64px] min-w-[64px]" />
      </a>
      <div className="flex flex-col w-full overflow-hidden justify-center relative z-[2] items-center">
        <a
          href={createLink("store", id)}
          target="_blank"
          className="w-full overflow-hidden"
        >
          <Typography
            className="text-lg lg:text-xl font-semibold truncate text-white w-full text-center block whitespace-nowrap"
          >
            {title}
          </Typography>
        </a>
        <Typography color="gray" className="truncate relative -top-1 text-xs sm:text-sm w-full text-center">
          {summary}
        </Typography>
      </div>
      <div className="flex flex-col mt-0 sm:mt-2 items-center relative z-[2] justify-center w-full gap-2">
        <div
          className="flex items-center bg-blue-600 justify-center py-1 px-4 rounded-full"
        >
          <ItemPrice currency={currency} price={price} />
        </div>
        <ItemSelectToCart id={id} />
      </div>
    </div>
  )
}

const ItemsNotFound = () => {
  return (
    <div className="flex flex-col gap-2 items-center h-full justify-center w-full">
      <img src={getStaticImage("items/block_inspect.webp")} width={64} height={64} alt="" />
      <Typography className="text-xl font-semibold">Доступных товаров нет</Typography>
    </div>
  )
}

export const StoreList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(storeItemsDataAtom)

  if (!data.length) return <ItemsNotFound />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-auto gap-2 lg:gap-4 w-full h-full">
      {data.map(item => <StoreItem key={item.id} {...item} />)}
    </div>
  )
}, "StoreList")