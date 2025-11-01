import { skinAction } from "../models/skin.model";
import { skinViewerAtom } from "../models/skin-animation.model";
import { reatomComponent } from "@reatom/npm-react";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";
import { clientOnly } from "vike-react/clientOnly";
import { hardwareAccIsEnabledAtom } from "../../player/components/skin";

const ReactSkinview3d = clientOnly(() => import("react-skinview3d").then(m => m.ReactSkinview3d))

export const SkinRender = reatomComponent(({ ctx }) => {
  const skin = ctx.spy(skinAction.dataAtom)

  if (ctx.spy(skinAction.statusesAtom).isPending) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!skin) return null;

  return (
    <div className="flex items-center min-h-[450px] justify-center overflow-hidden w-full">
      {ctx.spy(hardwareAccIsEnabledAtom) ? (
        <ReactSkinview3d
          skinUrl={skin}
          height="450"
          width="300"
          options={{ zoom: 0.8 }}
          className="cursor-move"
          onReady={({ viewer }) => skinViewerAtom(ctx, viewer)}
          fallback={<Skeleton className="w-full h-full" />}
        />
      ) : (
        <div className="flex w-full px-2 py-6 items-center justify-center h-full">
          <Typography color="gray" className="text-lg truncate text-center whitespace-pre-wrap">
            Графическое аппаратное ускорение не включено
          </Typography>
        </div>
      )}
    </div>
  );
}, "SkinRender")