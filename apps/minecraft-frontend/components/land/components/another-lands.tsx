import { BlockWrapper } from "#components/wrappers/components/block-wrapper"
import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/src/components/typography"
import { anotherLandsByOwnerAction, anotherLandsByOwnerAtom } from "../models/land.model"
import { Skeleton } from "@repo/ui/src/components/skeleton"
import { Avatar } from "#components/user/avatar/components/avatar"
import { CustomLink } from "#components/shared/link"
import { createIdLink } from "@repo/lib/utils/create-link"

const List = reatomComponent(({ ctx }) => {
  const data = ctx.spy(anotherLandsByOwnerAtom)

  if (!data) return null;

  return (
    data.map((land) => (
      <CustomLink key={land.ulid} to={createIdLink("land", land.ulid)} className="flex bg-shark-900 gap-2 rounded-lg p-2 w-full items-center">
        <Avatar nickname={land.members[0].nickname} propHeight={22} propWidth={22} rounded="default" />
        {land.name}
      </CustomLink>
    ))
  )
})

export const AnotherLandsByOwner = reatomComponent(({ ctx }) => {
  const isLoading = ctx.spy(anotherLandsByOwnerAction.statusesAtom).isPending

  return (
    <BlockWrapper className="flex flex-col overflow-hidden justify-end !p-4 gap-4 w-full">
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
          <Typography className="text-[20px] font-semibold">
            Похожие территории
          </Typography>
          <div className="flex flex-col gap-2 w-full">
            <List />
          </div>
        </>
      )}
    </BlockWrapper >
  )
}, "AnotherLandsByOwner")