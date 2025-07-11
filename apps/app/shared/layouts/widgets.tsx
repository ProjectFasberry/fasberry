import { action, atom, onConnect, withReset } from "@reatom/framework"
import { reatomComponent } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import { IconArrowRight, IconLock, IconX } from "@tabler/icons-react"
import { ReactNode } from "react"
import { tv } from "tailwind-variants"
import { navigate } from "vike/client/router"
import { motion } from "motion/react"
import { withCookie } from "@reatom/persist-web-storage"
import { currentUserAtom } from "../api/global.model"

const widgetVariant = tv({
  base: `flex items-center p-2 sm:p-3 lg:p-4 gap-2 sm:gap-4 justify-between rounded-lg w-full max-h-16 bg-neutral-900 border-2 border-neutral-800`
})

type WidgetProps = {
  id: string,
  icon?: any,
  title: string,
  description?: string
  action: ReactNode,
}

const Widget = ({ title, icon: Icon, description, action }: WidgetProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={widgetVariant()}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        {Icon && (
          <div className="flex bg-neutral-800 rounded-full p-2">
            <Icon size={26} />
          </div>
        )}
        <div className="flex flex-col justify-center">
          <Typography className="truncate w-full font-semibold text-base sm:text-lg">
            {title}
          </Typography>
          {description && (
            <Typography color="gray" className="w-full hidden sm:inline truncate text-sm leading-5">
              {description}
            </Typography>
          )}
        </div>
      </div>
      {action && (
        <div className="w-fit flex items-center justify-center">
          {action}
        </div>
      )}
    </motion.div>
  )
}

const AuthWidgetActions = reatomComponent(({ ctx }) => {
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

const isShowAuthWidgetAtom = atom(true, "isShowAuthWidget").pipe(
  withCookie({ maxAge: 43200, path: "/" })('show-a-widget')
)

const isAuthedAtom = atom<boolean>((ctx) => {
  const show = ctx.spy(isShowAuthWidgetAtom);

  if (show === false) {
    return true;
  }

  return !!ctx.spy(currentUserAtom)
}, "isAuthedAtom")

const allWidgetSources = [isAuthedAtom];
const activeWidgetAtom = atom<WidgetProps | null>(null, "activeWidget").pipe(withReset())

const initWidgets = action((ctx) => {
  for (const widget of allWidgetSources) {
    const target = ctx.get(widget)

    if (!target) {
      activeWidgetAtom(ctx, {
        id: 'auth',
        icon: IconLock,
        title: 'Вы не авторизованы',
        description: 'Авторизируйтесь, чтобы получить доступ к полному функционалу сайта.',
        action: (
          <AuthWidgetActions />
        ),
      })
    }
  }
}, "initWidgets")

onConnect(activeWidgetAtom, initWidgets)

export const Widgets = reatomComponent(({ ctx }) => {
  const active = ctx.spy(activeWidgetAtom)
  if (!active) return null;

  return (
    <div id="widgets" className="hidden sm:flex items-center justify-center w-full fixed bottom-2 left-0 right-0">
      <div className="mx-auto responsive">
        <Widget {...active} />
      </div>
    </div>
  )
}, "Widgets")