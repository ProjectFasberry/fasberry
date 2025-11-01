import { logRouting } from "@/shared/lib/log";
import { PageContext } from "vike/types";

export const data = async (pageContext: PageContext) => {
  logRouting(pageContext.urlPathname, "data")
}