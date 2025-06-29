import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import { Link } from '@/shared/components/config/Link';
import { Sheet, SheetContent, SheetTitle } from '@repo/ui/sheet';
import { reatomComponent } from "@reatom/npm-react";
import { currentUserAtom } from "../api/global.model";
import { Avatar } from "../components/app/avatar/avatar";
import { Button } from "@repo/ui/button";
import { navigate } from "vike/client/router";

const createLink = (type: "player" | "land", value: string) => {
  return `/${type}/${value}`
}

const HeaderUser = reatomComponent<{ nickname: string }>(({ ctx, nickname }) => {
  return (
    <Link
      href={createLink("player", nickname)}
      className="w-[38px] h-[38px] overflow-hidden rounded-md border border-neutral-400"
    >
      <Avatar nickname={nickname} propHeight={38} propWidth={38} className="min-w-[38px] min-h-[38px] w-[38px] h-[38px]" />
    </Link>
  )
}, "HeaderUser")

const AuthorizeButton = reatomComponent(({ ctx }) => {
  return (
    <Button onClick={() => navigate("/auth")} className="bg-green-500 rounded-md font-semibold text-neutral-50">
      Авторизоваться
    </Button>
  )
}, "AuthorizeButton")

export const Header = reatomComponent(({ ctx }) => {
  const user = ctx.spy(currentUserAtom)

  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={v => setOpen(v)}>
        <SheetContent className="flex bg-neutral-700 flex-col gap-4 w-full z-[100]">
          <SheetTitle></SheetTitle>
          <Link href="/">
            <p className="font-semibold">Главная</p>
          </Link>
          <Link href="/lands">
            <p className="font-semibold">Территории</p>
          </Link>
          <Link href="/ratings">
            <p className="font-semibold">Рейтинг</p>
          </Link>
          {user ? <HeaderUser nickname={user.nickname} /> : <AuthorizeButton />}
        </SheetContent>
      </Sheet>
      <div className="flex  items-center justify-start w-full border border-neutral-800 z-[20] h-20 top-0">
        <div className="flex items-center justify-between px-2 sm:px-6 w-full">
          <a href="/" className="bg-transparent cursor-pointer relative">
            <img src="/favicon.ico" width={56} height={56} alt="" />
          </a>
          <div className="sm:hidden block">
            <IconMenu2 onClick={() => setOpen(true)} size={36} className="text-neutral-400 sm:hidden block" />
          </div>
          <div
            className="hidden sm:flex items-center h-20 text-neutral-400
            *:flex *:items-center *:justify-center *:border-b *:h-full *:px-6 *:data-[state=inactive]:border-transparent *:data-[state=active]:border-green-500"
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
          {user ? <HeaderUser nickname={user.nickname} /> : <AuthorizeButton />}
        </div>
      </div>
    </>
  )
}, "Header")