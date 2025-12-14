import { StoreFilterList, StoreFiltersSheet, StoreSearch, storeSectionWrapper } from "@/shared/components/app/shop/components/filters/store-filters";
import { StoreList } from "@/shared/components/app/shop/components/items/store-list";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { Typography } from "@repo/ui/typography";

const storeImage = getStaticImage("images/marketplace_art.webp")

const StorePreviewImage = () => {
  return (
    <div className="flex select-none flex-col items-center justify-end relative overflow-hidden h-[180px] rounded-lg w-full">
      <img
        src={storeImage}
        draggable={false}
        alt=""
        width={800}
        height={800}
        className="absolute w-full h-[300px] rounded-lg object-cover object-top"
      />
      <div className="absolute bottom-0 bg-gradient-to-t h-[60px] from-black/60 via-black/20 to-transparent w-full" />
    </div>
  )
}

export default function Page() {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <StorePreviewImage />
      <div className="flex flex-col gap-4 h-full w-full">
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
      </div>
    </div>
  )
}
