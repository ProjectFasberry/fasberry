import { LANDING_ENDPOINT } from "@/shared/env"
import { wrapTitle } from "@/shared/lib/wrap-title"
import { useConfig } from "vike-react/useConfig"
import { PageContext } from "vike/types"

export const data = async (pageContext: PageContext) => {
  const config = useConfig()

  const url = `${LANDING_ENDPOINT}${pageContext.urlPathname}`

  config({
    title: wrapTitle("Модпаки"),
    Head: (
      <>
        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
      </>
    )
  })
}