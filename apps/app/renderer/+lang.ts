import { PageContextServer } from "vike/types"

export default (pageContext: PageContextServer) => {
  return pageContext.locale
}