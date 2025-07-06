import { Typography } from "@repo/ui/typography";
import Inspect from "@repo/assets/images/minecraft/block_inspect.webp"

export const ItemsNotFound = () => {
  return (
    <div className="flex flex-col gap-2 items-center h-full justify-center w-full">
      <img src={Inspect} width={64} height={64} alt="" />
      <Typography className="text-xl font-semibold">Доступных товаров нет</Typography>
    </div>
  )
}