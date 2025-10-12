import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import { navigate } from "vike/client/router"

export const TopUpButton = () => {
  return (
    <div className="flex grow justify-end h-full items-center">
      <Button className="self-end bg-neutral-900" onClick={() => navigate("/store/topup")}>
        <Typography className="text-neutral-50 font-semibold">
          Пополнить
        </Typography>
      </Button>
    </div>
  )
}