import { IconArrowRight, IconBasket, IconCategory, IconChevronUp, IconStars, IconUsersGroup } from "@tabler/icons-react";
import { createLink, Link } from '@/shared/components/config/link';
import { reatomComponent } from "@reatom/npm-react";
import { currentUserAtom, currentUserPermsAtom } from "../models/current-user.model";
import { Avatar } from "../components/app/avatar/components/avatar";
import { Button } from "@repo/ui/button";
import { navigate } from "vike/client/router";
import { Typography } from "@repo/ui/typography";
import { usePageContext } from "vike-react/usePageContext";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Separator } from "@repo/ui/separator";
import { logout } from "../components/app/auth/models/auth.model";
import { atom, spawn } from "@reatom/framework";
import { Fragment } from "react/jsx-runtime";

export const AuthorizeButton = () => {
  return (
    <Button
      onClick={() => navigate("/auth")}
      className="h-10 p-0 sm:px-4 sm:py-2 aspect-square sm:aspect-auto bg-green-700 rounded-lg"
    >
      <Typography className="hidden sm:inline font-semibold text-neutral-50 text-md sm:text-base">
        Авторизоваться
      </Typography>
      <IconArrowRight size={20} className="sm:hidden" />
    </Button>
  )
}

const MENU_LINKS = [
  {
    title: "Задания",
    href: "/tasks",
    permission: null,
    type: "default",
  },
  {
    title: "Системная панель",
    href: "/private",
    permission: "system_panel_access",
    type: "privated"
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
  const handle = () => void spawn(ctx, async (spawnCtx) => logout(spawnCtx))

  return (
    <>
      <PopoverClose>
        <Button
          className="flex items-center justify-start gap-2 hover:bg-neutral-800 w-full rounded-lg px-2 py-1"
          disabled={ctx.spy(logout.isLoading)}
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
  )
}, "HeaderMenu")

const HeaderUser = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)

  if (!currentUser) return <AuthorizeButton />

  return (
    <div className="flex items-center gap-3 bg-neutral-900 pr-2 rounded-lg">
      <Link
        href={createLink("player", currentUser.nickname)}
        className="w-10 h-10 overflow-hidden rounded-md"
      >
        <Avatar
          nickname={currentUser.nickname}
          propHeight={38}
          propWidth={38}
          className="min-w-10 min-h-10 w-10 h-10 aspect-square"
        />
      </Link>
      <HeaderMenu />
    </div>
  )
}, "HeaderUser")

const LINKS = [
  {
    title: "Главная",
    icon: IconCategory,
    label: "Перейти на главную",
    href: "/",
  },
  {
    title: "Территории",
    icon: IconUsersGroup,
    label: "Перейти к территориям",
    href: "/lands",
  },
  {
    title: "Рейтинг",
    icon: IconStars,
    label: "Перейти к рейтингу",
    href: "/ratings",
  },
  {
    title: "Магазин",
    icon: IconBasket,
    label: "Перейти к магазину",
    href: "/store",
  },
]

const MobileBottomBar = () => {
  return (
    <div className="md:hidden z-[20] fixed flex items-center justify-center bottom-0 px-4 border-t border-neutral-700 bg-neutral-800 h-20 w-full">
      <div className="flex items-center justify-between w-full *:data-[state=inactive]:text-neutral-50 *:data-[state=active]:text-green-500">
        {LINKS.map(link => (
          <Link key={link.title} aria-label={link.label} href={link.href}>
            <div className="flex items-center justify-center">
              <link.icon size={30} />
            </div>
            <span className="font-semibold text-[13px]">{link.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const Header = () => {
  const pathname = usePageContext().urlPathname;

  return (
    <>
      <MobileBottomBar />
      <div className="flex items-center justify-start w-full border-b border-neutral-800 relative z-[20] h-20 top-0">
        <div className="flex items-center justify-between px-2 sm:px-6 w-full">
          <div className="w-1/5 bg-transparent h-14 relative">
            <Link aria-label="Перейти на главную" href="/" className="flex h-full w-fit items-center gap-3">
              <img src="/favicon.ico" width={48} height={48} alt="" />
              <Typography className="font-bold text-2xl">
                Fasberry
              </Typography>
            </Link>
          </div>
          <div
            className="hidden md:flex w-3/5 justify-center items-center h-20 text-neutral-400
            *:flex *:items-center *:justify-center *:border-b *:h-full *:px-6 
            *:data-[state=inactive]:border-transparent *:data-[state=active]:border-green-500"
          >
            {LINKS.map(link => (
              <Link key={link.title} aria-label={link.label} href={link.href}>
                <p className="font-semibold">{link.title}</p>
              </Link>
            ))}
          </div>
          <div className="flex gap-2 items-center w-full md:w-1/5 justify-end">
            {pathname.includes("/store") && (
              <Link
                href="/store/cart"
                className="flex items-center h-10 justify-center bg-neutral-900 p-2 rounded-lg"
              >
                <IconBasket size={26} className="text-neutral-400" />
              </Link>
            )}
            <HeaderUser />
          </div>
        </div>
      </div>
    </>
  )
}