import { GuardAsync } from "vike/types";
import { validateSession } from "@/shared/api/validators";
import { redirect } from "vike/abort";

export const guard: GuardAsync = async (pageContext) => {
  const isValid = await validateSession({ headers: pageContext.headers ?? undefined })

  if (isValid) {
    throw redirect("/")
  }
}