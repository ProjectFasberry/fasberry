import { reatomComponent } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { activeWidgetAtom, isShowAuthWidgetAtom } from "../models/widgets.model"
import { navigate } from "vike/client/router"
import { IconArrowRight, IconX } from "@tabler/icons-react"
import { Typography } from "@repo/ui/typography"

export const AuthWidgetActions = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        className="bg-neutral-50 px-2"
        onClick={() => {
          activeWidgetAtom.reset(ctx)
          navigate("/auth")
        }}
      >
        <IconArrowRight size={20} className="sm:hidden inline text-neutral-950" />
        <Typography className="hidden sm:inline text-neutral-950 font-semibold text-base sm:text-lg">
          Авторизоваться
        </Typography>
      </Button>
      <Button
        className="bg-neutral-800 px-2"
        onClick={() => {
          activeWidgetAtom.reset(ctx)
          isShowAuthWidgetAtom(ctx, false)
        }}>
        <IconX size={20} className="sm:hidden inline"/>
        <Typography className="hidden text-nowrap sm:inline font-semibold text-base sm:text-lg">
          Не показывать
        </Typography>
      </Button>
    </div>
  )
}, "AuthWidgetActions")
