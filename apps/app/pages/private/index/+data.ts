import { getUrlWithLocale } from "@/shared/locales/helpers"
import { redirect } from "vike/abort"
import { PageContext } from "vike/types"

export const data = async (pageContext: PageContext) => {
  const url = getUrlWithLocale(pageContext, "/private/config")
  throw redirect(url)
}