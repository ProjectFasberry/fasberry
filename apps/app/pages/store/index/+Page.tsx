import { StoreFilterList, StoreFiltersSheet } from "@/shared/components/app/shop/components/filters/store-filters";
import { StoreList } from "@/shared/components/app/shop/components/items/store-list";
import { onChange, storeItemsSearchQueryAtom } from "@/shared/components/app/shop/models/store.model";
import { isClientAtom } from "@/shared/models/page-context.model";
import { reatomComponent } from "@reatom/npm-react";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";
import { IconSearch } from "@tabler/icons-react";
import { tv } from "tailwind-variants";

export const storeSectionWrapper = tv({
  base: `bg-neutral-900 rounded-lg`,
  variants: {
    variant: {
      default: "p-2 sm:p-3 lg:p-4",
      reset: ""
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

const StoreSearch = reatomComponent(({ ctx }) => {
  const isClient = ctx.spy(isClientAtom);
  const searchQuery = isClient ? ctx.spy(storeItemsSearchQueryAtom) : ""

  return (
    <div className={storeSectionWrapper({ className: "flex h-10 items-center justify-start w-full relative", variant: "reset" })}>
      <IconSearch size={18} className="text-neutral-400 absolute left-2 sm:left-4" />
      <Input
        value={searchQuery}
        placeholder="Найти..."
        className='bg-transparent w-full pl-8 sm:pl-12'
        onChange={e => onChange(ctx, e)}
        maxLength={1024}
      />
    </div>
  )
}, "StoreSearch")

export default function Page() {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-semibold">
        Магазин
      </Typography>
      <StoreSearch />
      <div className="flex flex-col gap-4 xl:flex-row items-start w-full h-full">
        <div className="flex flex-col gap-2 h-full w-full xl:w-1/5">
          <div className="xl:hidden block">
            <StoreFiltersSheet />
          </div>
          <div className={storeSectionWrapper({ className: "hidden xl:flex flex-col gap-6 w-full h-full" })}>
            <StoreFilterList />
          </div>
        </div>
        <div className={storeSectionWrapper({ className: "flex flex-col items-start w-full h-fit gap-4 xl:w-4/5 min-h-dvh" })}>
          <StoreList />
        </div>
      </div>
    </div >
  )
}
