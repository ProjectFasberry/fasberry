import { SETTINGS_NODES } from "@/shared/components/app/settings/models/settings.model"
import { usePageContext } from "vike-react/usePageContext"

export default function Page() {
  const { routeParams } = usePageContext()
  return SETTINGS_NODES[routeParams.id][routeParams.child]
}