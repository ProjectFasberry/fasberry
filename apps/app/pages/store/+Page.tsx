import { Store } from "@/shared/components/app/shop/components/store";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";

export default function StorePage() {
  return (
    <MainWrapperPage padding="small">
      <div className="flex flex-col gap-4 w-full h-full">
        <Typography className="text-3xl font-semibold">
          Магазин
        </Typography>
        <Store />
      </div>
    </MainWrapperPage>
  )
}