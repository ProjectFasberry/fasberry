import { reatomComponent } from "@reatom/npm-react"
import { anotherLandsByOwnerAction } from "../models/land.model"
import { Link } from "@/shared/components/config/Link"
import { Avatar } from "@/shared/components/app/avatar/avatar"
import { Skeleton } from "@repo/ui/skeleton"
import { onConnect } from "@reatom/framework"

onConnect(anotherLandsByOwnerAction.dataAtom, anotherLandsByOwnerAction)

export const AnotherLandsByOwner = reatomComponent(({ ctx }) => {
  const data = ctx.spy(anotherLandsByOwnerAction.dataAtom)

  return (
    <div className="flex flex-col overflow-hidden bg-neutral-900 rounded-md justify-end !p-2 gap-4 w-full">
      {ctx.spy(anotherLandsByOwnerAction.statusesAtom).isPending && (
        <>
          <Skeleton className="h-10 w-2/3" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </>
      )}
      {data && (
        <>
          <p className="text-[20px] font-semibold">
            Похожие территории
          </p>
          <div className="flex flex-col gap-2 w-full">
            {data.map((land) => (
              <Link key={land.ulid} href={`/land/${land.ulid}`} className="flex bg-neutral-800 gap-2 rounded-lg p-2 w-full items-center">
                <Avatar nickname={land.members[0].nickname} propHeight={22} propWidth={22} />
                {land.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div >
  )
}, "AnotherLandsByOwner")