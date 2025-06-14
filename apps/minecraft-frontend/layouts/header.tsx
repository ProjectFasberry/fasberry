import { Link } from "@/shared/components/Link";
import { IconMenu2 } from "@tabler/icons-react";
import { useState } from "react";
import { clientOnly } from "vike-react/clientOnly";

const Sheet = clientOnly(() => import("@repo/ui/src/components/sheet").then(m => m.Sheet))
const SheetContent = clientOnly(() => import("@repo/ui/src/components/sheet").then(m => m.SheetContent))
const SheetTitle = clientOnly(() => import("@repo/ui/src/components/sheet").then(m => m.SheetTitle))

export const Header = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={v => setOpen(v)}>
        <SheetContent className="flex bg-neutral-700 flex-col gap-4 w-full z-[100]">
          <SheetTitle></SheetTitle>
          <Link href="/">
            <p className="font-semibold">Главная</p>
          </Link>
          <Link href="/stats">
            <p className="font-semibold">Статистика</p>
          </Link>
          <Link href="/wiki">
            <p className="font-semibold">Вики</p>
          </Link>
          <Link href="/lands">
            <p className="font-semibold">Регионы</p>
          </Link>
        </SheetContent>
      </Sheet>
      <div className="flex items-center justify-start w-full border border-neutral-800 absolute h-20 top-0">
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
            <Link href="/stats">
              <p className="font-semibold">Статистика</p>
            </Link>
            <Link href="/wiki">
              <p className="font-semibold">Вики</p>
            </Link>
            <Link href="/lands">
              <p className="font-semibold">Регионы</p>
            </Link>
          </div>
          <div className="hidden sm:block"></div>
        </div>
      </div>
    </>
  )
}