import { reatomComponent } from "@reatom/npm-react"
import { createLink, Link } from "@/shared/components/config/link"
import { Avatar } from "@/shared/components/app/avatar/components/avatar"
import { Skeleton } from "@repo/ui/skeleton"
import { anotherLandsByOwnerAction } from "../models/land.model"
import { Typography } from "@repo/ui/typography"

const List = reatomComponent(({ ctx }) => {
  const data = ctx.spy(anotherLandsByOwnerAction.dataAtom)?.data

  if (!data) return null;

  return (
    data.map((land) => (
      <Link
        key={land.ulid}
        href={createLink("land", land.ulid)}
        className="flex bg-neutral-800 gap-2 rounded-lg p-2 w-full items-center"
      >
        <Avatar nickname={land.members[0].nickname} propHeight={22} propWidth={22} />
        {land.name}
      </Link>
    ))
  )
}, "AnotherLandsByOwnerList")

export const AnotherLandsByOwner = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col overflow-hidden bg-neutral-900 rounded-lg justify-end p-2 gap-4 w-full">
      <Typography className="text-xl font-semibold">
        Похожие территории
      </Typography>
      {ctx.spy(anotherLandsByOwnerAction.statusesAtom).isPending && (
        <>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </>
      )}
      <div className="flex flex-col gap-2 w-full">
        <List />
      </div>
    </div >
  )
}, "AnotherLandsByOwner")