import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { Link } from "@/shared/components/config/link";

export const PurchasesHistory = () => {
  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex flex-col min-w-0">
        <Typography color="white" className="text-2xl font-semibold">
          Покупки
        </Typography>
        <Typography color="gray" className="truncate">
          Здесь отображена история ваших покупок
        </Typography>
      </div>
      <Link href="/store/cart/orders">
        <Button background="white" className="w-fit">
          <Typography className="font-semibold">
            Перейти
          </Typography>
        </Button>
      </Link>
    </div>
  )
}