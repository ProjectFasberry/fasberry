import { Shop } from "@/shared/components/app/shop/shop";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";

export default function StorePage() {
  return (
    <MainWrapperPage padding="small">
      <Shop />
    </MainWrapperPage>
  )
}