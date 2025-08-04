import { GuardAsync } from "vike/types";
import { redirect } from "vike/abort";
import { validatePrivate } from "@/shared/lib/validators";
import { logRouting } from "../store/i/@id/+data";

export const guard: GuardAsync = async (pageContext) => {
  logRouting(pageContext.urlPathname, "guard");

  const isValid = await validatePrivate({ headers: pageContext.headers ?? undefined })

  if (!isValid) {
    throw redirect("/")
  }
}