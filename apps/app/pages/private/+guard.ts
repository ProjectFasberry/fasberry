import { GuardAsync } from "vike/types";
import { redirect } from "vike/abort";
import { validatePrivate } from "@/shared/lib/validators";
import { logRouting } from "@/shared/lib/log";

export const guard: GuardAsync = async (pageContext) => {
  logRouting(pageContext.urlPathname, "guard");

  const headers = pageContext.headers ?? undefined

  const isValid = await validatePrivate({ headers })

  if (!isValid) {
    throw redirect("/")
  }
}