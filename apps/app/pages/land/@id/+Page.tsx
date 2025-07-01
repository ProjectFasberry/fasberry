import { pageContextAtom } from "@/shared/api/global.model"
import { Land } from "@/shared/components/app/land/components/land"
import { landAtom } from "@/shared/components/app/land/models/land.model"
import { MainWrapperPage } from "@repo/ui/main-wrapper"
import { Data } from "./+data"
import { PageContext } from "vike/types"

const getLandUrl = (id: string) => `/land/${id}`

pageContextAtom.onChange((ctx, state) => {
  if (!state) return;

  const target = state as PageContext<Data>
  const land = target.data?.land ?? null

  if (target.urlPathname === getLandUrl(target.routeParams.id)) {
    landAtom(ctx, land)
  }
})

export default function LandPage() {
  return (
    <MainWrapperPage>
      <div className="flex items-start gap-4 w-full">
        <Land />
      </div>
    </MainWrapperPage>
  )
}