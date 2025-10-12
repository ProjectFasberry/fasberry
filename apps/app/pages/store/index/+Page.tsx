import { StoreFilters } from "@/shared/components/app/shop/components/filters/store-filters";
import { StoreList } from "@/shared/components/app/shop/components/items/store-list";
import { SetRecipientDialog } from "@/shared/components/app/shop/components/recipient/set-recipient";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";

const DefaultStore = () => {
  return (
    <>
      <Typography className="text-3xl font-semibold">
        Магазин
      </Typography>
      <div className="flex flex-col w-full h-full gap-4">
        <div className="flex flex-col gap-4 lg:flex-row items-start w-full h-full">
          <div className="flex flex-col gap-2 h-full w-full lg:w-1/5">
            <div className="flex flex-col gap-6 p-4 bg-neutral-900 w-full h-full rounded-lg">
              <StoreFilters />
            </div>
          </div>
          <div className="flex flex-col w-full lg:w-4/5 min-h-[85vh] bg-neutral-900 gap-8 rounded-lg">
            <div className="flex flex-col items-start w-full h-fit p-2 sm:p-3 lg:p-4 gap-4">
              <StoreList />
              <SetRecipientDialog />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <MainWrapperPage padding="small">
      <div className="flex flex-col gap-4 w-full h-full">
        <DefaultStore />
      </div>
    </MainWrapperPage>
  )
}