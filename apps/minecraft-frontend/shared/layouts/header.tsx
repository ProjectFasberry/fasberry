import { Link } from "@/shared/components/config/Link";
import { MAIN_HEADER } from '@repo/shared/wiki/data/configs';
import { Avatar } from "@/shared/components/app/avatar/avatar";
import { usePageContext } from "vike-react/usePageContext";
import { lazy, Suspense } from "react";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";

const HeaderMobileSheet = lazy(() => import("./header-mobile").then(m => ({ default: m.HeaderSheet })))

const HeaderItemMenu = ({ name, childs, href }: typeof MAIN_HEADER[0]) => {
  const pathname = usePageContext().urlParsed.pathname;
  const isActive = pathname === href;

  const pathDetect = (href: string | null) => {
    if (!href) return;

    if (pathname === href) {
      return toast.info("Вы уже на этой странице", {
        icon: <img alt="" loading="lazy" width={32} height={32} src="/images/minecraft/icons/bell.webp" />
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group">
        {href ? (
          <Link
            onClick={() => pathDetect(href)}
            href={href}
            className="flex items-center gap-1 mx-2"
          >
            {isActive && (
              <img src="/images/minecraft/icons/experience_big.webp" width={20} alt="" height={20} />
            )}
            <p
              data-href={href}
              data-state={isActive}
              className="hover:brightness-150 text-neutral-300 text-md data-[state=active]:brightness-[1.8] data-[href=/store]:text-gold"
            >
              {name}
            </p>
            {childs && (
              <>
                <span className="text-white group-data-[state=open]:inline hidden">⏶</span>
                <span className="text-white group-data-[state=closed]:inline hidden">⏷</span>
              </>
            )}
          </Link>
        ) : (
          <div
            onClick={() => pathDetect(href)}
            className="flex items-center gap-1 mx-2 cursor-pointer"
          >
            <p
              data-href={href}
              data-state={isActive}
              className="hover:brightness-150 text-neutral-300 text-md data-[state=active]:brightness-[1.8] data-[href=/store]:text-gold"
            >
              {name}
            </p>
            {childs && (
              <>
                <span className="text-white group-data-[state=open]:inline hidden">⏶</span>
                <span className="text-white group-data-[state=closed]:inline hidden">⏷</span>
              </>
            )}
          </div>
        )}
      </DropdownMenuTrigger>
      {childs && (
        <DropdownMenuContent className="rounded-md z-[1000] bg-neutral-950 w-[200px]">
          <div className="flex flex-col py-2 px-4 gap-2 w-full">
            {childs.map(item => (
              <div key={item.name} className="flex items-center gap-1 cursor-pointer">
                {item.href === pathname && (
                  <img src="/images/minecraft/icons/experience_big.webp" width={16} alt="" height={16} />
                )}
                <Link href={item.href || "/"}>
                  <p className="hover:brightness-150 text-lg text-project-color">
                    {item.name}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}

const HeaderUser = () => {
  // @ts-expect-error
  const nickname = usePageContext().nickname as string | undefined
  if (!nickname) return null;

  return (
    <Link href={`/player/${nickname}`} className="w-[38px] h-[38px] overflow-hidden rounded-md border border-neutral-400">
      <Avatar url={null} nickname={nickname} propHeight={38} propWidth={38} />
    </Link>
  )
}

export const Header = () => {
  return (
    <div
      className="header flex items-center justify-between absolute top-0 transition w-full bg-repeat-x z-50
        bg-[url('/images/static/cracked_polished_blacked.webp')] "
      style={{ backgroundSize: '160px' }}
    >
      <Link href="/" className="bg-transparent cursor-pointer relative md:-right-[40px] top-3 xl:-right-[60px]">
        <img src="/images/fasberry_logo.webp" width={224} height={64} title="Fasberry" alt="Fasberry" />
      </Link>
      <div className="hidden xl:flex gap-x-4 items-center justify-start pr-[132px]">
        {MAIN_HEADER.map(item => (
          <HeaderItemMenu key={item.name} childs={item.childs} name={item.name} href={item.href} />
        ))}
        <HeaderUser />
      </div>
      <Suspense>
        <HeaderMobileSheet />
      </Suspense>
    </div>
  );
};

// export const HeaderV1 = () => {
//   const [open, setOpen] = useState(false)

//   return (
//     <>
//       <Sheet open={open} onOpenChange={v => setOpen(v)}>
//         <SheetContent className="flex bg-neutral-700 flex-col gap-4 w-full z-[100]">
//           <SheetTitle></SheetTitle>
//           <Link href="/">
//             <p className="font-semibold">Главная</p>
//           </Link>
//           <Link href="/stats">
//             <p className="font-semibold">Статистика</p>
//           </Link>
//           <Link href="/wiki">
//             <p className="font-semibold">Вики</p>
//           </Link>
//           <Link href="/lands">
//             <p className="font-semibold">Регионы</p>
//           </Link>
//         </SheetContent>
//       </Sheet>
//       <div className="flex items-center justify-start w-full border border-neutral-800 absolute h-20 top-0">
//         <div className="flex items-center justify-between px-2 sm:px-6 w-full">
//           <a href="/" className="bg-transparent cursor-pointer relative">
//             <img src="/favicon.ico" width={56} height={56} alt="" />
//           </a>
//           <div className="sm:hidden block">
//             <IconMenu2 onClick={() => setOpen(true)} size={36} className="text-neutral-400 sm:hidden block" />
//           </div>
//           <div
//             className="hidden sm:flex items-center h-20 text-neutral-400
//             *:flex *:items-center *:justify-center *:border-b *:h-full *:px-6 *:data-[state=inactive]:border-transparent *:data-[state=active]:border-green-500"
//           >
//             <Link href="/">
//               <p className="font-semibold">Главная</p>
//             </Link>
//             <Link href="/stats">
//               <p className="font-semibold">Статистика</p>
//             </Link>
//             <Link href="/wiki">
//               <p className="font-semibold">Вики</p>
//             </Link>
//             <Link href="/lands">
//               <p className="font-semibold">Регионы</p>
//             </Link>
//           </div>
//           <div className="hidden sm:block"></div>
//         </div>
//       </div>
//     </>
//   )
// }