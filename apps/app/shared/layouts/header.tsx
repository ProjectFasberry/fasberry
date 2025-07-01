import { IconCategory, IconMenu2, IconStars, IconUsersGroup } from "@tabler/icons-react";
import { Link } from '@/shared/components/config/Link';
import { reatomComponent } from "@reatom/npm-react";
import { currentUserAtom } from "../api/global.model";
import { Avatar } from "../components/app/avatar/avatar";
import { Button } from "@repo/ui/button";
import { navigate } from "vike/client/router";

const createLink = (type: "player" | "land", value: string) => `/${type}/${value}`

export const AuthorizeButton = reatomComponent(({ ctx }) => {
  return (
    <Button onClick={() => navigate("/auth")} className="bg-green-500 rounded-md font-semibold text-neutral-50">
      Авторизоваться
    </Button>
  )
}, "AuthorizeButton")

const HeaderUser = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)

  return currentUser ? (
    <Link
      href={createLink("player", currentUser.nickname)}
      className="w-[38px] h-[38px] overflow-hidden rounded-md border border-neutral-400"
    >
      <Avatar nickname={currentUser.nickname} propHeight={38} propWidth={38} className="min-w-[38px] min-h-[38px] w-[38px] h-[38px]" />
    </Link>
  ) : <AuthorizeButton />
}, "HeaderUser")

export const Header = () => {
  return (
    <>
      <div className="sm:hidden z-[20] fixed flex items-center justify-center bottom-0 px-6 rounded-t-md bg-neutral-800 h-16 w-full">
        <div className="flex items-center justify-between w-full *:data-[state=inactive]:text-neutral-400 *:data-[state=active]:text-green-500">
          <Link href="/">
            <div className="flex items-center justify-center">
              <IconCategory size={34} />
            </div>
          </Link>
          <Link href="/lands">
            <div className="flex items-center justify-center">
              <IconUsersGroup size={34} />
            </div>
          </Link>
          <Link href="/ratings">
            <div className="flex items-center justify-center">
              <IconStars size={34} />
            </div>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-start w-full border-b border-neutral-800 z-[20] h-20 top-0">
        <div className="flex items-center justify-between px-2 sm:px-6 w-full">
          <Link href="/" className="bg-transparent relative">
            <img src="/favicon.ico" width={56} height={56} alt="" />
          </Link>
          <div
            className="hidden sm:flex items-center h-20 text-neutral-400
            *:flex *:items-center *:justify-center *:border-b *:h-full *:px-6 
            *:data-[state=inactive]:border-transparent *:data-[state=active]:border-green-500"
          >
            <Link href="/">
              <p className="font-semibold">Главная</p>
            </Link>
            <Link href="/lands">
              <p className="font-semibold">Территории</p>
            </Link>
            <Link href="/ratings">
              <p className="font-semibold">Рейтинг</p>
            </Link>
          </div>
          <HeaderUser />
        </div>
      </div>
    </>
  )
}