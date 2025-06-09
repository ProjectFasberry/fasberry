import { landAtom } from "#components/land/models/land.model"
import { CustomLink } from "#components/shared/link"
import { Avatar } from "#components/user/avatar/components/avatar.tsx"
import { UserNickname } from "#components/user/name/nickname"
import { reatomComponent } from "@reatom/npm-react"
import { createIdLink } from "@repo/lib/utils/create-link"

export const LandMembers = reatomComponent(({ ctx }) => {
  const land = ctx.get(landAtom)
  if (!land) return null;

  return (
    <>
      <div className="flex flex-col gap-2 w-full h-full">
        {land.members.map(({ uuid, nickname }) => (
          <div
            key={uuid}
            className="flex w-full items-end gap-2 rounded-md p-2 hover:bg-shark-700"
          >
            <CustomLink to={createIdLink("user", nickname)}>
              <Avatar nickname={nickname} propWidth={64} propHeight={64} />
            </CustomLink>
            <CustomLink to={createIdLink("user", nickname)}>
              <UserNickname nickname={nickname} />
            </CustomLink>
          </div>
        ))}
      </div>
    </>
  )
}, "LandMembers")