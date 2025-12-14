import { SETTINGS_NAVIGATION, SettingsNavigation } from "@/shared/components/app/settings/models/settings.model";
import { Link } from "@/shared/components/config/link";
import { atom } from "@reatom/core";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarProvider, 
  SidebarTrigger, 
  useSidebar 
} from "@repo/ui/sidebar";
import { Typography } from "@repo/ui/typography";
import { ReactNode, useEffect, useState } from "react";

const isExpandedAtom = atom(true, "isExpanded")

const MOBILE_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

const Navigation = reatomComponent(({ ctx }) => {
  return (
    <div className='flex flex-col w-full'>
      <div className="flex flex-col gap-4 w-full">
        <NavigationList />
      </div>
    </div>
  )
}, "Navigation")

const NavigationItem = reatomComponent<SettingsNavigation>(({ ctx, title, nodes }) => {
  const { setOpenMobile } = useSidebar();

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-semibold line-clamp-2 leading-4 text-sm text-neutral-400">
        {title}
      </h2>
      <div className="flex flex-col gap-1">
        {nodes.map((node) => (
          <Link
            key={node.href}
            href={node.href}
            onClick={() => setOpenMobile(false)}
            className="
                flex items-center group rounded-lg gap-2 h-10 px-2 justify-start
              data-[state=active]:bg-neutral-700 data-[state=inactive]:hover:bg-neutral-700
              "
          >
            <node.icon size={20} />
            <Typography className="font-medium truncate">
              {node.title}
            </Typography>
          </Link>
        ))}
      </div>
    </div>
  )
}, "NavigationItem")

const NavigationList = () => {
  const data = Object.entries(SETTINGS_NAVIGATION)
  return data.map(([key, section]) => <NavigationItem key={key} {...section} />)
}

const SidebarNav = reatomComponent(({ ctx }) => {
  if (ctx.spy(isExpandedAtom)) {
    return (
      <div className="flex flex-col gap-8 h-full sticky top-2 min-w-10 sm:w-1/4 sm:max-w-1/4">
        <Navigation />
      </div>
    )
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <Navigation />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}, "SidebarNav")

const SidebarTriggerWrap = reatomComponent(
  ({ ctx }) => !ctx.spy(isExpandedAtom) && <SidebarTrigger />,
  "SidebarTriggerWrap"
)

const SyncMobile = () => {
  const isMobile = useIsMobile()
  useUpdate((ctx) => isExpandedAtom(ctx, !isMobile), [isMobile])
  return null;
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <SyncMobile />
      <div className="flex items-start w-full gap-2 sm:gap-4 h-full">
        <SidebarNav />
        <div className="flex flex-col gap-4 overflow-hidden w-full h-full">
          <SidebarTriggerWrap />
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}