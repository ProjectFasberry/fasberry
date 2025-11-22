import { SETTINGS_FALLBACK, SETTINGS_NODES } from "@/shared/components/app/settings/models/settings.model";
import { redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const data = async ({ routeParams }: PageContext) => {
  const section = SETTINGS_NODES[routeParams.id][routeParams.child]
  if (!section) throw redirect(SETTINGS_FALLBACK)
}