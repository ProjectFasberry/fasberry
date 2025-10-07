import { PageContextServer } from "vike/types";
import { validateSession } from "@/shared/lib/validators";
import { redirect } from "vike/abort";
import { logRouting } from "@/shared/lib/log";

export const guard = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "guard");

  const headers = pageContext.headers ?? undefined

  const isValid = await validateSession({ headers })
  
  if (isValid) {
    throw redirect("/")
  }
}