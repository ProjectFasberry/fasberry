import { PageContextServer } from "vike/types";
import { redirect } from "vike/abort";
import { validatePrivate } from "@/shared/lib/validators";
import { logRouting } from "@/shared/lib/log";
import { CURRENT_USER_KEY } from "@/shared/models/current-user.model";

export const guard = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "guard");

  const user = pageContext.snapshot[CURRENT_USER_KEY] ?? null;
  if (!user) throw redirect("/")

  const headers = pageContext.headers ?? undefined

  const isValid = await validatePrivate({ headers })
  if (!isValid) throw redirect("/")
}