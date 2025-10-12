import { logRouting } from "@/shared/lib/log";
import { CURRENT_USER_KEY } from "@/shared/models/current-user.model";
import { redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = async (pageContext: PageContext) => {
  logRouting(pageContext.urlPathname, "guard");
  const user = pageContext.snapshot[CURRENT_USER_KEY] ?? null;
  if (!user) throw redirect("/store")
}