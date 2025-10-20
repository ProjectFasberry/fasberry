import { Link } from "@/shared/components/config/link";
import { usePageContext } from "vike-react/usePageContext";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { getStaticObject } from "../lib/volume";
import { MAIN_HEADER } from "../data/configs";
import { clientOnly } from "vike-react/clientOnly";

const HeaderSheet = clientOnly(() => import("./header-mobile").then(m => m.HeaderSheet))

const HeaderItemMenu = ({ name, childs, href }: typeof MAIN_HEADER[0]) => {
  const pathname = usePageContext().urlParsed.pathname;
  const isActive = pathname === href;

  const pathDetect = (href: string | null) => {
    if (!href) return;

    if (pathname === href) {
      return toast.info("Вы уже на этой странице", {
        icon: <img alt="" loading="lazy" width={32} height={32} src={getStaticObject("minecraft/icons", "bell.webp")} />
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
              <img src={getStaticObject("minecraft/icons", "experience_big.webp")} width={20} alt="" height={20} />
            )}
            <p
              data-href={href}
              data-state={isActive}
              className="hover:brightness-150 text-neutral-300 text-md data-[state=active]:brightness-[1.8]"
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
              className="hover:brightness-150 text-neutral-300 text-md data-[state=active]:brightness-[1.8]"
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
                  <img src={getStaticObject("minecraft/icons", "experience_big.webp")} width={16} alt="" height={16} />
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

const bgImage = getStaticObject("static", "cracked_polished_blacked.webp")
const logoImage = getStaticObject("static", "fasberry_logo.webp")

export const Header = () => {
  return (
    <div
      className={`header flex items-center justify-between absolute top-0 transition w-full bg-repeat-x z-50`}
      style={{ backgroundSize: '160px', backgroundImage: `url(${bgImage})` }}
    >
      <Link href="/" className="bg-transparent cursor-pointer relative md:-right-[40px] top-3 xl:-right-[60px]">
        <img src={logoImage} width={224} height={64} title="Fasberry" alt="Fasberry" />
      </Link>
      <div className="hidden xl:flex gap-5 items-center justify-start pr-[132px]">
        {MAIN_HEADER.map(item => (
          <HeaderItemMenu key={item.name} childs={item.childs} name={item.name} href={item.href} />
        ))}
      </div>
      <HeaderSheet />
    </div>
  );
}