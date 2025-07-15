import { StoreFilters } from "@/shared/components/app/shop/components/filters/store-filters";
import { StoreList } from "@/shared/components/app/shop/components/items/store-list";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";
import { usePageContext } from "vike-react/usePageContext";

const WalletsStore = () => {
  return (
    <>
      <Typography className="text-3xl font-semibold">
        Покупка валюты
      </Typography>
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-col gap-4 lg:flex-row items-start w-full h-full">
          <div className="flex flex-col gap-6 p-4 h-full w-full rounded-lg">

          </div>
        </div>
      </div>
    </>
  )
}

const DefaultStore = () => {
  return (
    <>
      <Typography className="text-3xl font-semibold">
        Магазин
      </Typography>
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-col gap-4 lg:flex-row items-start w-full h-full">
          <div className="flex flex-col gap-6 p-4 bg-neutral-900 h-full w-full lg:w-1/5 rounded-lg">
            <StoreFilters />
          </div>
          <div className="flex flex-col w-full lg:w-4/5 min-h-[85vh] bg-neutral-900 gap-8 rounded-lg">
            <div className="flex flex-col items-start w-full h-fit p-4 gap-4">
              <StoreList />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function StorePage() {
  const search = usePageContext().urlParsed.search;

  const targetIsWallet = search["q"] === 'wallet'

  return (
    <MainWrapperPage padding="small">
      <div className="flex flex-col gap-4 w-full h-full">
        {targetIsWallet ? <WalletsStore/> : <DefaultStore />}
      </div>
    </MainWrapperPage>
  )
}