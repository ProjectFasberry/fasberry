import { reatomComponent } from "@reatom/npm-react"
import { anotherLandsByOwnerAction, anotherLandsByOwnerAtom } from "../models/land.model"
import { Link } from "@/shared/components/config/Link"
import { Avatar } from "@/shared/components/app/avatar/avatar"
import { Skeleton } from "@repo/ui/skeleton"

const List = reatomComponent(({ ctx }) => {
  const data = ctx.spy(anotherLandsByOwnerAtom)

  if (!data) return null;

  return (
    data.map((land) => (
      <Link key={land.ulid} href={`/land/${land.ulid}`} className="flex bg-shark-900 gap-2 rounded-lg p-2 w-full items-center">
        <Avatar nickname={land.members[0].nickname} propHeight={22} propWidth={22} />
        {land.name}
      </Link>
    ))
  )
})

export const AnotherLandsByOwner = reatomComponent(({ ctx }) => {
  const isLoading = ctx.spy(anotherLandsByOwnerAction.statusesAtom).isPending

  return (
    <div className="flex flex-col overflow-hidden justify-end !p-4 gap-4 w-full">
      {isLoading ? (
        <>
          <Skeleton className="h-10 w-2/3" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </>
      ) : (
        <>
          <p className="text-[20px] font-semibold">
            Похожие территории
          </p>
          <div className="flex flex-col gap-2 w-full">
            <List />
          </div>
        </>
      )}
    </div >
  )
}, "AnotherLandsByOwner")