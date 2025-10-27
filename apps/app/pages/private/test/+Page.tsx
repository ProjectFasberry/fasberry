import { EditorTest } from "@/shared/components/config/editor"
import { Link } from "@/shared/components/config/link"
import { locales } from "@/shared/locales"
import { getClientLocale, translate } from "@/shared/locales/helpers"
import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { usePageContext } from "vike-react/usePageContext"

const ChangeLanguage = reatomComponent(({ ctx }) => {
  const currentLocale = getClientLocale(ctx)
  const textLocalized = translate("Сменить язык", currentLocale);
  const pathname = usePageContext().urlPathname;

  return (
    <>
      <Typography>
        {textLocalized}
      </Typography>
      <div className="flex flex-col w-full gap-1">
        {locales.map((locale) => (
          <Link
            key={locale}
            locale={locale}
            href={pathname}
            data-state={currentLocale === locale}
            className="data-[state=true]:bg-neutral-600 data-[state=false]:bg-neutral-800 rounded-lg px-2 py-1"
          >
            {locale.toUpperCase()}
          </Link>
        ))}
      </div>
    </>
  )
}, "ChangeLanguage")

export default function Page() {
  return (
    <>
      <div className="bg-neutral-900 rounded-xl p-4">
        <ChangeLanguage />
      </div>
      <div className="bg-neutral-900 rounded-xl p-4">
        <EditorTest />
      </div>
    </>
  )
}