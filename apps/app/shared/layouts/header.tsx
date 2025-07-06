import { IconBasket, IconCategory, IconMenu2, IconStars, IconUsersGroup } from "@tabler/icons-react";
import { Link } from '@/shared/components/config/Link';
import { reatomComponent } from "@reatom/npm-react";
import { currentUserAtom } from "../api/global.model";
import { Avatar } from "../components/app/avatar/avatar";
import { Button } from "@repo/ui/button";
import { navigate } from "vike/client/router";

const createLink = (type: "player" | "land", value: string) => `/${type}/${value}`

export const AuthorizeButton = reatomComponent(({ ctx }) => {
  return (
    <Button onClick={() => navigate("/auth")} className="bg-green-700 rounded-lg font-semibold text-neutral-50">
      Авторизоваться
    </Button>
  )
}, "AuthorizeButton")

const HeaderUser = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)

  if (!currentUser) return <AuthorizeButton />

  return (
    <Link
      href={createLink("player", currentUser.nickname)}
      className="w-[38px] h-[38px] overflow-hidden rounded-md border border-neutral-400"
    >
      <Avatar nickname={currentUser.nickname} propHeight={38} propWidth={38} className="min-w-[38px] min-h-[38px] w-[38px] h-[38px]" />
    </Link>
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
    label: "Перейти к территориям игроков",
    href: "/lands",
  },
  {
    title: "Рейтинг",
    icon: IconStars,
    label: "Перейти к рейтингу игроков",
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
    <div className="md:hidden z-[20] fixed flex items-center justify-center bottom-0 px-6 rounded-t-md bg-neutral-800 h-16 w-full">
      <div className="flex items-center justify-between w-full *:data-[state=inactive]:text-neutral-400 *:data-[state=active]:text-green-500">
        {LINKS.map(link => (
          <Link key={link.title} aria-label={link.label} href={link.href}>
            <div className="flex items-center justify-center">
              <link.icon size={34} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const Header = () => {
  return (
    <>
      <MobileBottomBar />
      <div className="flex items-center justify-start w-full border-b border-neutral-800 z-[20] h-20 top-0">
        <div className="flex items-center justify-between px-2 sm:px-6 w-full">
          <Link aria-label="Перейти на главную" href="/" className="w-1/5 bg-transparent relative">
            <img src="/favicon.ico" width={52} height={52} alt="" />
          </Link>
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
          <div className="flex items-center w-full md:w-1/5 justify-end">
            <HeaderUser />
          </div>
        </div>
      </div>
    </>
  )
}