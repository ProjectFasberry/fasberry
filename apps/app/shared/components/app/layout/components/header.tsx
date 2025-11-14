import { IconArrowBadgeRight, IconBasket, IconCategory, IconChevronUp, IconStars, IconUsersGroup } from "@tabler/icons-react";
import { createLink, Link } from '@/shared/components/config/link';
import { reatomComponent } from "@reatom/npm-react";
import { CONFIG_PANEL_READ_PERMISSION, currentUserAtom, currentUserPermsAtom } from "@/shared/models/current-user.model";
import { Avatar } from "@/shared/components/app/avatar/components/avatar";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { usePageContext } from "vike-react/usePageContext";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Separator } from "@repo/ui/separator";
import { atom, spawn } from "@reatom/framework";
import { Fragment } from "react/jsx-runtime";
import { isAuthAtom } from "@/shared/models/page-context.model";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog";
import { Switch } from "@repo/ui/switch";
import { playerSeemsLikePlayersIsShowAtom, toggleShowAction } from "@/shared/components/app/player/models/player-seems-like.model";
import { beforeLogoutAction, logoutAction } from "../../auth/models/logout.model";
import { AlertDialog } from "@/shared/components/config/alert-dialog";
import { cartDataSelectedItemsLengthAtom, cartIsTriggeredAtom } from "../../shop/models/store-cart.model";

export const AuthorizeButton = () => {
  return (
    <Link
      href="/auth"
      aria-label="Авторизоваться"
      className="inline-flex items-center justify-center gap-1 h-10 min-w-10 p-0 sm:px-4 sm:py-2 bg-green-700 rounded-lg"
    >
      <Typography className="hidden sm:inline select-none font-semibold text-neutral-50 text-md sm:text-base">
        Войти
      </Typography>
      <IconArrowBadgeRight size={22} />
    </Link>
  )
}

const MENU_LINKS = [
  {
    title: "Задания", href: "/tasks", permission: null, type: "default",
  },
  {
    title: "Рефералы", href: "/referrals", permission: null, type: "default"
  },
  {
    title: "Системная панель", href: "/private", permission: CONFIG_PANEL_READ_PERMISSION, type: "privated"
  },
];

type MenuLink = (typeof MENU_LINKS)[number]

const validatedLinksAtom = atom((ctx) => {
  const opts = ctx.get(currentUserPermsAtom)

  const validatedLinks = MENU_LINKS.filter(s => {
    if (s.type === 'privated') {
      if (s.permission) {
        return opts.includes(s.permission)
      }
    }

    return true
  }) as MenuLink[]

  return validatedLinks
}, "validatedLinks")

const HeaderMenuActions = reatomComponent(({ ctx }) => {
  const handle = () => beforeLogoutAction(ctx)

  return (
    <>
      <PopoverClose asChild>
        <Button
          className="flex items-center justify-start gap-2 hover:bg-neutral-800 w-full rounded-lg px-2 py-1"
          onClick={() => userSettingsDialogIsOpenAtom(ctx, true)}
        >
          <Typography className="font-semibold">
            Настройки
          </Typography>
        </Button>
      </PopoverClose>
      <PopoverClose asChild>
        <Button
          className="flex items-center justify-start gap-2 hover:bg-neutral-800 w-full rounded-lg px-2 py-1"
          disabled={ctx.spy(logoutAction.statusesAtom).isPending}
          onClick={handle}
        >
          <Typography className="font-semibold text-red-500">
            Выйти из аккаунта
          </Typography>
        </Button>
      </PopoverClose>
    </>
  )
}, "HeaderMenuActions")

const HeaderMenu = reatomComponent(({ ctx }) => {
  const links = ctx.spy(validatedLinksAtom)

  return (
    <>
      <AlertDialog />
      <UserSettingsDialog />
      <Popover>
        <PopoverTrigger className="group h-full">
          <IconChevronUp
            size={20}
            className="group-data-[state=open]:rotate-0 group-data-[state=closed]:rotate-180
              duration-150 ease-in-out text-neutral-400"
          />
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom">
          <div className="flex flex-col gap-2 w-full">
            {links.map((link, idx, arr) => {
              const isPrivated = link.type === 'privated'
              const firstPrivatedIndex = arr.findIndex(l => l.type === 'privated')
              const lastPrivatedIndex = arr.map(l => l.type).lastIndexOf('privated')

              return (
                <Fragment key={link.href}>
                  {isPrivated && idx === firstPrivatedIndex && <Separator />}
                  <PopoverClose>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 hover:bg-neutral-800 rounded-lg px-2 py-1"
                    >
                      <Typography className="font-semibold text-neutral-200">
                        {link.title}
                      </Typography>
                    </Link>
                  </PopoverClose>
                  {isPrivated && idx === lastPrivatedIndex && <Separator />}
                </Fragment>
              )
            })}
            <HeaderMenuActions />
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}, "HeaderMenu")

const HeaderUser = reatomComponent(({ ctx }) => {
  const isAuth = ctx.spy(isAuthAtom)
  if (!isAuth) return <AuthorizeButton />

  const currentUser = ctx.spy(currentUserAtom);
  if (!currentUser) return null;

  return (
    <div className="flex items-center w-fit min-w-0 gap-2 h-10 bg-neutral-800 px-3 rounded-xl">
      <Link
        href={createLink("player", currentUser.nickname)}
        className="flex items-center gap-3 h-8 overflow-hidden"
      >
        <Typography className="text-base font-semibold truncate">
          {currentUser.nickname.slice(0, 32)}
        </Typography>
        <Avatar
          nickname={currentUser.nickname}
          propHeight={32}
          propWidth={32}
          className="min-w-8 min-h-8 w-8 h-8 aspect-square"
        />
      </Link>
      <HeaderMenu />
    </div>
  )
}, "HeaderUser")

const userSettingsDialogIsOpenAtom = atom(false, "userSettingsDialogIsOpen")

const UserSettingsDialog = reatomComponent(({ ctx }) => {
  return (
    <Dialog open={ctx.spy(userSettingsDialogIsOpenAtom)} onOpenChange={v => userSettingsDialogIsOpenAtom(ctx, v)}>
      <DialogContent>
        <DialogTitle className="text-center font-bold text-2xl leading-tight">
          Настройки
        </DialogTitle>
        <div className="flex flex-col gap-4 w-full h-full">
          <div className="flex items-center justify-between w-full gap-1">
            <Typography className="font-semibold">
              Показывать похожих игроков
            </Typography>
            <Switch
              checked={ctx.spy(playerSeemsLikePlayersIsShowAtom)}
              onCheckedChange={v => toggleShowAction(ctx)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "UserSettingsDialog")

const LINKS = [
  { title: "Главная", icon: IconCategory, label: "Перейти на главную", href: "/", },
  { title: "Территории", icon: IconUsersGroup, label: "Перейти к территориям", href: "/lands", },
  { title: "Рейтинг", icon: IconStars, label: "Перейти к рейтингу", href: "/ratings", },
  { title: "Магазин", icon: IconBasket, label: "Перейти к магазину", href: "/store", },
]

const MobileBottomBar = () => {
  return (
    <div
      className="md:hidden z-[50] fixed flex items-center
        rounded-t-xl justify-center bottom-0 px-4 border-t border-neutral-700 bg-neutral-800 h-20 w-full"
    >
      <div className="flex items-center justify-between w-full
        gap-1 *:data-[state=inactive]:text-neutral-50 *:data-[state=active]:text-green-500"
      >
        {LINKS.map(link => (
          <Link key={link.title} aria-label={link.label} href={link.href} className="truncate min-w-0">
            <div className="flex items-center justify-center">
              <link.icon size={30} />
            </div>
            <span className="font-semibold text-sm">
              {link.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

const HeaderCartTrigger = reatomComponent(({ ctx }) => {
  const isTriggered = ctx.spy(cartIsTriggeredAtom);
  const cartLength = ctx.spy(cartDataSelectedItemsLengthAtom)

  return (
    <Link
      aria-label="Перейти на главную"
      href="/store/cart"
      data-trigger={isTriggered}
      className="duration-150 relative flex items-center h-10 justify-center bg-neutral-800 p-2 rounded-xl
        data-[trigger=true]:scale-[1.15] group data-[trigger=false]:scale-100
      "
    >
      <IconBasket
        size={26}
        className="group-data-[trigger=true]:text-green-500 group-data-[trigger=false]:text-neutral-400"
      />
      {cartLength >= 1 && (
        <div
          className="absolute font-semibold -bottom-1 -right-1
          bg-neutral-50 text-neutral-950 rounded-sm aspect-square w-4 h-4 flex items-center justify-center"
        >
          <span className="text-sm">{cartLength}</span>
        </div>
      )}
    </Link>
  )
}, "HeaderCartTrigger")

export const Logotype = () => {
  return (
    <Link
      aria-label="Перейти на главную"
      href="/"
      className="flex h-full w-fit items-center gap-3"
    >
      <img src="/favicon.ico" width={48} height={48} alt="" className="min-w-10 w-10 max-h-10 min-h-10" />
      <Typography className="hidden md:inline font-bold text-2xl">
        Fasberry
      </Typography>
    </Link>
  )
}

export const Header = () => {
  const pathname = usePageContext().urlPathname;

  return (
    <>
      <MobileBottomBar />
      <div className="flex items-center justify-start w-full border-b border-neutral-800 relative z-20 h-20 top-0">
        <div className="flex items-center justify-between px-2 gap-2 sm:px-6 w-full">
          <div className="w-1/5 bg-transparent h-14 relative">
            <Logotype />
          </div>
          <div
            className="hidden md:flex w-3/5 justify-center items-center h-20 text-neutral-400
            *:flex *:items-center *:justify-center *:border-b *:h-full *:px-4
            *:data-[state=inactive]:border-transparent *:data-[state=active]:border-green-500"
          >
            {LINKS.map(link => (
              <Link key={link.title} aria-label={link.label} href={link.href}>
                <p className="font-semibold">{link.title}</p>
              </Link>
            ))}
          </div>
          <div className="flex gap-1 items-center w-full md:w-1/5 justify-end">
            {pathname.includes("/store") && <HeaderCartTrigger />}
            <HeaderUser />
          </div>
        </div>
      </div>
    </>
  )
}
