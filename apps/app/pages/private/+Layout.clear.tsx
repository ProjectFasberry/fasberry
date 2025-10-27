import { Link } from "@/shared/components/config/link";
import { scrollableVariant } from "@/shared/consts/style-variants";
import { currentUserAtom, currentUserPermsAtom, currentUserRoleAtom } from "@/shared/models/current-user.model";
import { action, atom } from "@reatom/core";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Separator } from "@repo/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui/sheet";
import { Typography } from "@repo/ui/typography";
import { IconLayoutSidebarRightInactive } from "@tabler/icons-react";
import { PropsWithChildren } from "react"
import { tv } from "tailwind-variants";
import { 
  SidebarProvider, 
  SidebarTrigger, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarGroupLabel, 
  useSidebar 
} from "@repo/ui/sidebar"
import { Logotype } from "@/shared/components/app/layout/components/header";
import { useIsMobile } from "@/shared/lib/hooks";
import { appDictionariesAtom } from "@/shared/models/app.model";

const linkVariant = tv({
  base: `flex justify-start items-center group h-10 border-2 border-neutral-800 rounded-lg px-4
    data-[state=inactive]:bg-transparent data-[state=active]:bg-neutral-800`,
  slots: {
    text: "text-lg font-semibold text-nowrap text-neutral-50"
  }
})

const links = [
  { title: "Конфигурация", value: "/private/config" },
  { title: "Действия", value: "/private/actions" },
  { title: "Аналитика", value: "/private/analytics" },
  { title: "Магазин", value: "/private/store" },
  { title: "Игрок", value: "/private/users" },
  { title: "История", value: "/private/history" },
  { title: "Test", value: "/private/test" },
]

const Navigation = () => {
  const isMobile = useIsMobile()
  const { setOpen } = useSidebar();

  return (
    links.map((link) => (
      <Link
        key={link.title}
        href={link.value}
        onClick={() => isMobile && setOpen(false)}
        className={linkVariant().base()}
      >
        <Typography className={linkVariant().text()}>
          {link.title}
        </Typography>
      </Link>
    ))
  )
}

type Perms = {
  read: string[],
  create: string[],
  update: string[],
  delete: string[],
  unknown: string[],
}

const permsAtom = atom<Perms>({
  read: [],
  create: [],
  update: [],
  delete: [],
  unknown: [],
});

const transformPermissionsByNamespaceAction = action((ctx) => {
  const targets = ctx.get(currentUserPermsAtom);
  if (!targets) return null;

  permsAtom(ctx, {
    read: targets.filter(t => t.endsWith(".read")),
    create: targets.filter(t => t.endsWith(".create")),
    update: targets.filter(t => t.endsWith(".update")),
    delete: targets.filter(t => t.endsWith(".delete")),
    unknown: targets.filter(
      t => !/\.(read|create|update|delete)$/.test(t)
    ),
  });
}, "transformPermissionsByNamespaceAction")

const Info = reatomComponent(({ ctx }) => {
  useUpdate(transformPermissionsByNamespaceAction, []);

  const currentUser = ctx.spy(currentUserAtom);
  if (!currentUser) return null;

  const perms = ctx.spy(permsAtom)

  const groups = [
    { title: "Read", data: perms.read },
    { title: "Create", data: perms.create },
    { title: "Update", data: perms.update },
    { title: "Delete", data: perms.delete },
    { title: "Unknown", data: perms.unknown },
  ].filter(g => g.data && g.data.length > 0);

  const role = ctx.spy(currentUserRoleAtom)
  if (!role) return null;

  const roleTitle = appDictionariesAtom.get(ctx, role.name)

  return (
    <Sheet>
      <SheetTrigger>
        <div className="flex rounded-lg h-10 overflow-hidden select-none px-4 gap-2 cursor-pointer bg-neutral-50/90 items-center">
          <Typography className="font-semibold text-neutral-950">
            Роль: <span className="text-blue-500">{roleTitle}</span>
          </Typography>
          <IconLayoutSidebarRightInactive className="text-neutral-950" size={18} />
        </div>
      </SheetTrigger>
      <SheetContent className='flex flex-col w-full rounded-lg gap-1'>
        <SheetTitle>Разрешения</SheetTitle>
        <div className="flex flex-col gap-2 overflow-y-auto scrollbar scrollbar-thumb-neutral-800 w-full">
          {groups.map((group, idx) => (
            <div key={group.title}>
              <Typography className="text-lg font-semibold mb-2">
                {group.title}
              </Typography>
              <div className="flex flex-col gap-1 w-full">
                {group.data.map(item => (
                  <span key={item} className="text-sm">
                    {item}
                  </span>
                ))}
              </div>
              {idx < groups.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}, "Info")

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="h-20 px-2 sm:px-6">
        <Logotype />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Info />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarMenu>
            <Navigation />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider >
      <AppSidebar />
      <div className="flex flex-col gap-2 px-2 sm:px-6 h-full w-full">
        <SidebarTrigger />
        {children}
      </div >
    </SidebarProvider >
  )
}