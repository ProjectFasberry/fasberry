import { GuardAsync } from "vike/types";
import { redirect } from "vike/abort";
import { validatePrivate } from "@/shared/api/validators";

export const guard: GuardAsync = async (pageContext) => {
  const isValid = await validatePrivate(pageContext.headers ?? undefined)

  if (!isValid) {
    throw redirect("/")
  }
}