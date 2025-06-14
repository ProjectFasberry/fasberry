import { Skeleton } from "@repo/ui/src/components/skeleton"
import { landsResource } from "../models/lands.model"
import { LandCard } from "./land-card"
import { reatomComponent } from "@reatom/npm-react"

export const LandsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(landsResource.dataAtom)
  const isLoading = ctx.spy(landsResource.statusesAtom).isPending

  if (isLoading) return <Skeleton className="h-16 w-full"/>
  
  if (!data) return null

  return data.data.map((land) => <LandCard key={land.ulid} {...land} />)
}, "LandsList")