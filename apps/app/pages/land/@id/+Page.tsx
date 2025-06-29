import { Land } from "@/shared/components/app/land/components/land"
import { usePageContext } from "vike-react/usePageContext"

export default function LandPage() {
  const id = usePageContext().routeParams.id

  return (
    <div className="flex items-start gap-4 w-full h-screen">
      <Land />
    </div>
  )
}