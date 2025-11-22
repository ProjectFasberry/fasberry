import { StoreFilterList, StoreFiltersSheet, StoreSearch, storeSectionWrapper } from "@/shared/components/app/shop/components/filters/store-filters";
import { StoreList } from "@/shared/components/app/shop/components/items/store-list";
import { Typography } from "@repo/ui/typography";

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
