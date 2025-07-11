import { isSsrAtom } from "@/shared/api/global.model";
import { reatomComponent } from "@reatom/npm-react";
import { Skeleton } from "@repo/ui/skeleton";
import { clientOnly } from "vike-react/clientOnly";
import { ProfileSkinControls } from "../../skin/components/profile-skin-controls";
import { targetUserAtom } from "../models/player.model";

const ProfileSkinRender = clientOnly(() => import("@/shared/components/app/skin/components/profile-skin-render").then(m => m.ProfileSkinRender))

export const PlayerSkin = reatomComponent(({ ctx }) => {
  const user = ctx.spy(targetUserAtom)

  if (!user) return null;

  if (ctx.spy(isSsrAtom)) {
    return <Skeleton className="w-full lg:w-1/3 lg:border lg:h-[520px]" />
  }

  return (
    <div className="flex flex-col h-full gap-2 w-full lg:w-1/3 lg:sticky  pt-2 lg:top-0">
      <div className="flex flex-col gap-2 justify-between w-full lg:min-h-[520px] lg:border lg:border-neutral-700 rounded-lg">
        <div className="hidden lg:flex flex-col items-center gap-2 w-full text-neutral-400">
          <ProfileSkinRender fallback={<Skeleton className="w-full h-[450px]" />} />
          <img
            src={user.avatar}
            width={48}
            alt={user.nickname}
            fetchPriority="high"
            loading="eager"
            height={48}
            className="cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
          />
        </div>
        <div className="flex lg:hidden flex-col justify-center items-center gap-2 p-6 w-full text-neutral-400">
          <img
            src={user.avatar}
            width={128}
            height={128}
            fetchPriority="high"
            loading="eager"
            alt={user.nickname}
            className="w-[128px] h-[128px] cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
          />
        </div>
      </div>
      <ProfileSkinControls />
    </div>
  )
}, "PlayerSkin")