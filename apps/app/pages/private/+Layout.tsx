import { Link } from "@/shared/components/config/link";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";
import { ReactNode } from "react"
import { tv } from "tailwind-variants";

const linkVariant = tv({
  base: `rounded-lg w-fit border border-neutral-800 hover:bg-neutral-800 px-4 py-2 data-[state=active]:bg-neutral-800 data-[state=inactive]:bg-transparent`,
  slots: {
    text: "text-lg font-semibold text-nowrap text-neutral-50"
  }
})

const links = [
  { title: "Конфиг", value: "/private/config" },
  { title: "Действия", value: "/private/actions" },
  { title: "Аналитика", value: "/private/analytics" },
  { title: "Магазин", value: "/private/store" },
  { title: "Юзеры", value: "/private/users" },
  { title: "Test", value: "/private/test" },
]

const Navigation = () => {
  return (
    <div
      className="flex items-center justify-start w-full
        scrollbar scrollbar-thumb-neutral-300 scrollbar-track-background-dark  overflow-x-auto gap-2 rounded-lg"
    >
      {links.map((link) => (
        <Link key={link.title} href={link.value} className={linkVariant().base()}>
          <Typography className={linkVariant().text()}>
            {link.title}
          </Typography>
        </Link>
      ))}
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MainWrapperPage>
      <div className="flex flex-col gap-2 h-full w-full">
        <Navigation />
        {children}
      </div>
    </MainWrapperPage>
  )
}