import { landsResource } from "#components/lands/models/lands.model"
import { LandCard } from "./land-card"
import { SectionSkeleton } from "#components/templates/components/section-skeleton"
import { reatomComponent } from "@reatom/npm-react"

export const LandsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(landsResource.dataAtom)
  const isLoading = ctx.spy(landsResource.statusesAtom).isPending

  if (isLoading) return <SectionSkeleton/>
  
  if (!data) return null

  return data.data.map((land) => <LandCard key={land.ulid} {...land} />)
}, "LandsList")