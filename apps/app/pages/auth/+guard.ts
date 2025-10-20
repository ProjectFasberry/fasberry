import { PageContextServer } from "vike/types";
import { redirect } from "vike/abort";
import { logRouting } from "@/shared/lib/log";
import { APP_OPTIONS_KEY, AppOptionsPayloadExtend } from "@/shared/models/app-options.model";

export const guard = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "guard");

  const actualSnapshot = pageContext.snapshot[APP_OPTIONS_KEY].data as AppOptionsPayloadExtend; 
  const isAuth = actualSnapshot.isAuth

  if (isAuth) throw redirect("/")
}