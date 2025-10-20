import { wrapTitle } from "@/shared/lib/wrap-title"
import { useConfig } from "vike-react/useConfig"
import { PageContext } from "vike/types"

export const data = async (pageContext: PageContext) => {
  const config = useConfig()

  config({
    title: wrapTitle("Технические проблемы")
  })
}