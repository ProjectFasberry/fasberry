import { Link } from "@/shared/components/config/link";
import { scrollableVariant } from "@/shared/consts/style-variants";
import { Typography } from "@repo/ui/typography";
import { PropsWithChildren } from "react"
import { tv } from "tailwind-variants";

const linkVariant = tv({
  base: `group h-10 border-2 border-neutral-800 rounded-xl px-4 py-1 
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
  { title: "Test", value: "/private/test" },
]

const Navigation = () => {
  return (
    <div
      className={scrollableVariant({
        className: "flex items-center overflow-x-auto pb-2 justify-start w-full gap-2 rounded-lg"
      })}
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

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-2 px-2 sm:px-6 h-full w-full">
      <Navigation />
      {children}
    </div>
  )
}