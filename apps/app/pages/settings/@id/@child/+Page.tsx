import { SETTINGS_NODES } from "@/shared/components/app/settings/models/settings.model"
import { usePageContext } from "vike-react/usePageContext"

export default function Page() {
  const { id, child } = usePageContext().routeParams
  return SETTINGS_NODES[id][child]
}