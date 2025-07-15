import { reatomComponent } from "@reatom/npm-react"
import { landAtom } from "../models/land.model";
import { createLink, Link } from "@/shared/components/config/link";
import { Avatar } from "@/shared/components/app/avatar/components/avatar";

export const LandMembers = reatomComponent(({ ctx }) => {
  const land = ctx.spy(landAtom)
  if (!land) return null;

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {land.members.map(({ uuid, nickname }) => (
        <div
          key={uuid}
          className="flex w-full items-end gap-2 rounded-md p-2 hover:bg-shark-700"
        >
          <Link href={createLink("player", nickname)}>
            <Avatar nickname={nickname} propWidth={64} propHeight={64} />
          </Link>
          <Link href={createLink("player", nickname)}>
            <p>{nickname}</p>
          </Link>
        </div>
      ))}
    </div>
  )
}, "LandMembers")