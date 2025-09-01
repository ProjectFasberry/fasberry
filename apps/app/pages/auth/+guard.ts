import { GuardAsync } from "vike/types";
import { validateSession } from "@/shared/lib/validators";
import { redirect } from "vike/abort";
import { logRouting } from "../store/i/@id/+data";

export const guard: GuardAsync = async (pageContext) => {
  const headers = pageContext.headers ?? undefined
  
  const isValid = await validateSession({ headers })
  
  logRouting(pageContext.urlPathname, "guard");
  
  if (isValid) {
    throw redirect("/")
  }
}