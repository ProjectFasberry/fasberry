import { GuardAsync } from "vike/types";
import { validateSession } from "@/shared/lib/validators";
import { redirect } from "vike/abort";
import { logRouting } from "../store/i/@id/+data";

export const guard: GuardAsync = async (pageContext) => {
  logRouting(pageContext.urlPathname, "guard");

  const isValid = await validateSession({ headers: pageContext.headers ?? undefined })

  if (isValid) {
    throw redirect("/")
  }
}