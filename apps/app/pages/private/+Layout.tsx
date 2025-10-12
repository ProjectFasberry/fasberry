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

const Navigation = () => {
  return (
    <div className="flex items-center justify-start w-full overflow-x-auto gap-2 rounded-lg">
      <Link href="/private/config" className={linkVariant().base()}>
        <Typography className={linkVariant().text()}>
          Конфиг
        </Typography>
      </Link>
      <Link href="/private/actions" className={linkVariant().base()}>
        <Typography className={linkVariant().text()}>
          Действия
        </Typography>
      </Link>
      <Link href="/private/analytics" className={linkVariant().base()}>
        <Typography className={linkVariant().text()}>
          Аналитика
        </Typography>
      </Link>
      <Link href="/private/store" className={linkVariant().base()}>
        <Typography className={linkVariant().text()}>
          Магазин
        </Typography>
      </Link>
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